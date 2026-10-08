import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import Sidebar from "../../components/painel/Sidebar";
import TicketConversation from "../../components/painel/tickets/TicketConversation";
import TicketList, {
  getTicketCategory,
} from "../../components/painel/tickets/TicketList";
import { api } from "../../services/api";
import { useAuth } from "../../services/AuthContext";
import { auth } from "../../services/firebase";
import { createTicketSocket } from "../../services/ticketSocket";
import {
  readTicketReadState,
  writeTicketReadState,
} from "../../services/ticketReadState";

import "./tickets.css";

function mergeMessages(current, incoming) {
  const byId = new Map(current.map((message) => [message.id, message]));
  const idByDiscordId = new Map(
    current
      .filter((message) => message.discord_message_id)
      .map((message) => [message.discord_message_id, message.id]),
  );

  for (const message of incoming) {
    const existingId =
      byId.has(message.id)
        ? message.id
        : message.discord_message_id
          ? idByDiscordId.get(message.discord_message_id)
          : undefined;

    if (existingId) {
      const existing = byId.get(existingId);
      byId.set(existingId, { ...existing, ...message });
      if (message.discord_message_id) {
        idByDiscordId.set(message.discord_message_id, existingId);
      }
    } else {
      byId.set(message.id, message);
      if (message.discord_message_id) {
        idByDiscordId.set(message.discord_message_id, message.id);
      }
    }
  }

  return [...byId.values()].sort((a, b) =>
    (a.created_at || "").localeCompare(b.created_at || ""),
  );
}

function getRequestErrorMessage(requestError, fallback) {
  const response = requestError.response?.data;
  if (typeof response?.error === "string" && response.error) {
    return response.error;
  }
  if (typeof response?.message === "string" && response.message) {
    return response.message;
  }
  return fallback;
}

export default function Tickets() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [filter, setFilter] = useState("open");
  const [selectedId, setSelectedId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [draft, setDraft] = useState("");
  const [readState, setReadState] = useState({ initialized: false });
  const [loadingReadState, setLoadingReadState] = useState(true);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [sending, setSending] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [error, setError] = useState("");
  const [connection, setConnection] = useState("connecting");
  const messagesEndRef = useRef(null);
  const selectedIdRef = useRef(selectedId);
  const messagesRef = useRef(messages);
  const readStateRef = useRef(readState);
  const authRefreshAttemptedRef = useRef(false);

  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    readStateRef.current = readState;
  }, [readState]);

  useEffect(() => {
    let active = true;
    setLoadingReadState(true);
    try {
      const stored = readTicketReadState(user.uid);
      if (active) {
        readStateRef.current = stored;
        setReadState(stored);
      }
    } catch (readError) {
      if (active) {
        setError("Não foi possível recuperar o estado de leitura dos tickets.");
      }
      console.error("Erro ao recuperar estado local dos tickets:", readError);
    } finally {
      if (active) setLoadingReadState(false);
    }
    return () => {
      active = false;
    };
  }, [user.uid]);

  const persistReadState = useCallback(
    (nextState) => {
      readStateRef.current = nextState;
      setReadState(nextState);
      try {
        writeTicketReadState(user.uid, nextState);
      } catch (storageError) {
        setError("Não foi possível salvar o estado de leitura dos tickets.");
        console.error("Erro ao salvar estado local dos tickets:", storageError);
      }
    },
    [user.uid],
  );

  const markTicketRead = useCallback(
    (ticketId, messageId) => {
      if (!ticketId || !messageId) return;
      const nextState = {
        ...readStateRef.current,
        initialized: true,
        [ticketId]: messageId,
      };
      persistReadState(nextState);
    },
    [persistReadState],
  );

  const loadTickets = useCallback(async () => {
    setLoadingTickets(true);
    try {
      const [openResponse, closedResponse] = await Promise.all([
        api.get("/tickets?status=open"),
        api.get("/tickets?status=closed"),
      ]);
      const loadedTickets = [...openResponse.data, ...closedResponse.data].sort(
        (a, b) => (b.updated_at || "").localeCompare(a.updated_at || ""),
      );
      const nextReadState = { ...readStateRef.current };
      const unread = new Set();

      for (const ticket of loadedTickets) {
        const lastMessage = ticket.last_message;
        const hasReadRecord = Object.prototype.hasOwnProperty.call(
          nextReadState,
          ticket.id,
        );
        if (!nextReadState.initialized && !hasReadRecord) {
          nextReadState[ticket.id] = lastMessage?.id || null;
        } else if (!hasReadRecord && !lastMessage?.id) {
          nextReadState[ticket.id] = null;
        } else if (
          lastMessage?.id &&
          lastMessage.id !== nextReadState[ticket.id] &&
          lastMessage.source === "discord"
        ) {
          unread.add(ticket.id);
        }
      }

      nextReadState.initialized = true;
      persistReadState(nextReadState);
      setTickets(loadedTickets);
      setSelectedId((current) =>
        current && loadedTickets.some((ticket) => ticket.id === current)
          ? current
            : loadedTickets[0]?.id || null,
      );
      setUnreadTicketIds((current) => new Set([...current, ...unread]));
    } catch (requestError) {
      setError(getRequestErrorMessage(requestError, "Não foi possível carregar os tickets."));
    } finally {
      setLoadingTickets(false);
    }
  }, [persistReadState]);

  const [unreadTicketIds, setUnreadTicketIds] = useState(() => new Set());

  useEffect(() => {
    if (!loadingReadState) loadTickets();
  }, [loadTickets, loadingReadState]);

  const visibleTickets = useMemo(
    () => tickets.filter((ticket) => getTicketCategory(ticket) === filter),
    [filter, tickets],
  );

  useEffect(() => {
    if (selectedId && visibleTickets.some((ticket) => ticket.id === selectedId)) {
      return;
    }
    setSelectedId(visibleTickets[0]?.id || null);
  }, [selectedId, visibleTickets]);

  const loadMessages = useCallback(async (ticketId) => {
    if (!ticketId) {
      setMessages([]);
      setNextCursor(null);
      setLoadingMessages(false);
      return;
    }

    setMessages([]);
    setNextCursor(null);
    setLoadingMessages(true);
    try {
      const response = await api.get(
        `/tickets/${ticketId}/messages?limit=100`,
      );
      if (selectedIdRef.current !== ticketId) return;
      setMessages(response.data.messages);
      setNextCursor(response.data.nextCursor);
      const lastMessage = response.data.messages[response.data.messages.length - 1];
      if (lastMessage) markTicketRead(ticketId, lastMessage.id);
    } catch (requestError) {
      if (selectedIdRef.current === ticketId) {
        setError(getRequestErrorMessage(requestError, "Não foi possível carregar as mensagens."));
      }
    } finally {
      if (selectedIdRef.current === ticketId) setLoadingMessages(false);
    }
  }, [markTicketRead]);

  useEffect(() => {
    loadMessages(selectedId);
  }, [loadMessages, selectedId]);

  useEffect(() => {
    setDraft("");
  }, [selectedId]);

  const synchronizeMessages = useCallback(
    async (ticketId) => {
      if (!ticketId || selectedIdRef.current !== ticketId) return;

      const currentMessages = messagesRef.current;
      const latest = currentMessages[currentMessages.length - 1];
      if (!latest?.id) {
        await loadMessages(ticketId);
        return;
      }

      let cursor = latest.id;
      while (selectedIdRef.current === ticketId) {
        const response = await api.get(
          `/tickets/${ticketId}/messages?limit=100&after=${encodeURIComponent(cursor)}`,
        );
        const incoming = response.data.messages;
        if (incoming.length) {
          setMessages((current) => mergeMessages(current, incoming));
          const latestIncoming = incoming[incoming.length - 1];
          markTicketRead(ticketId, latestIncoming.id);
        }

        const next = response.data.nextCursor;
        if (!next || next === cursor) break;
        cursor = next;
      }
    },
    [loadMessages, markTicketRead],
  );

  useEffect(() => {
    let active = true;
    let socket;

    async function connect() {
      try {
        socket = await createTicketSocket();
        if (!active) {
          socket.close();
          return;
        }

        socket.on("connect", () => {
          setConnection("connected");
          authRefreshAttemptedRef.current = false;
          loadTickets();
          const ticketId = selectedIdRef.current;
          if (ticketId) {
            synchronizeMessages(ticketId).catch((syncError) => {
              setError(
                getRequestErrorMessage(
                  syncError,
                  "Não foi possível sincronizar as mensagens recebidas.",
                ),
              );
            });
          }
        });
        socket.on("disconnect", () => setConnection("disconnected"));
        socket.on("connect_error", async () => {
          setConnection("disconnected");
          if (authRefreshAttemptedRef.current) return;
          authRefreshAttemptedRef.current = true;
          try {
            if (auth.currentUser) {
              socket.auth = { token: await auth.currentUser.getIdToken(true) };
              if (active) socket.connect();
            }
          } catch (refreshError) {
            setError("A conexão em tempo real foi recusada.");
            console.error("Erro ao renovar autenticação do atendimento:", refreshError);
          }
        });
        socket.on("ticket:message", (message) => {
          if (message.ticket_id === selectedIdRef.current) {
            setMessages((current) => mergeMessages(current, [message]));
            if (message.id) markTicketRead(message.ticket_id, message.id);
          } else if (
            message.author_type === "user" ||
            message.source === "discord"
          ) {
            setUnreadTicketIds((current) => new Set(current).add(message.ticket_id));
          }
          loadTickets();
        });
        socket.on("ticket:updated", loadTickets);
        socket.connect();
      } catch (socketError) {
        setConnection("disconnected");
        setError("Não foi possível conectar ao atendimento em tempo real.");
        console.error("Erro ao iniciar conexão de tickets:", socketError);
      }
    }

    connect();
    return () => {
      active = false;
      socket?.close();
    };
  }, [loadTickets, markTicketRead, synchronizeMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedId]);

  const selectedTicket = tickets.find((ticket) => ticket.id === selectedId);

  useEffect(() => {
    if (!selectedTicket) return;
    if (selectedTicket.last_message?.id) {
      markTicketRead(selectedTicket.id, selectedTicket.last_message.id);
    }
    setUnreadTicketIds((current) => {
      if (!current.has(selectedTicket.id)) return current;
      const next = new Set(current);
      next.delete(selectedTicket.id);
      return next;
    });
  }, [markTicketRead, selectedTicket]);

  async function loadOlderMessages() {
    if (!selectedId || !nextCursor || loadingOlder) return;
    setLoadingOlder(true);
    try {
      const response = await api.get(
        `/tickets/${selectedId}/messages?limit=100&before=${encodeURIComponent(nextCursor)}`,
      );
      if (selectedIdRef.current !== selectedId) return;
      setMessages((current) => mergeMessages(response.data.messages, current));
      setNextCursor(response.data.nextCursor);
    } catch (requestError) {
      setError(getRequestErrorMessage(requestError, "Não foi possível carregar o histórico anterior."));
    } finally {
      setLoadingOlder(false);
    }
  }

  async function sendMessage(event) {
    event.preventDefault();
    const content = draft.trim();
    if (!selectedId || !content || sending || selectedTicket?.status !== "open") {
      return;
    }

    setSending(true);
    try {
      const response = await api.post(`/tickets/${selectedId}/messages`, {
        content,
      });
      if (selectedIdRef.current === selectedId) {
        setMessages((current) => mergeMessages(current, [response.data.message]));
        markTicketRead(selectedId, response.data.message.id);
      }
      loadTickets();
      setDraft("");
      setError("");
    } catch (requestError) {
      setError(getRequestErrorMessage(requestError, "Não foi possível enviar a mensagem."));
    } finally {
      setSending(false);
    }
  }

  async function changeTicketStatus() {
    if (!selectedTicket || updatingStatus) return;
    const action = selectedTicket.status === "open" ? "close" : "reopen";
    setUpdatingStatus(true);
    try {
      await api.patch(`/tickets/${selectedTicket.id}/${action}`);
      setError("");
      await loadTickets();
    } catch (requestError) {
      setError(getRequestErrorMessage(requestError, "Não foi possível atualizar o ticket."));
    } finally {
      setUpdatingStatus(false);
    }
  }

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="dashboard-main tickets-main">
        <header className="tickets-header">
          <div>
            <p className="tickets-eyebrow">CENTRAL DE SUPORTE</p>
            <h1>Atendimento</h1>
            <p>Converse em tempo real com os usuários dos tickets do Discord.</p>
          </div>
          <span
            className={`tickets-connection is-${connection}`}
            role="status"
            aria-live="polite"
          >
            <i />
            {connection === "connected"
              ? "Tempo real conectado"
              : connection === "connecting"
                ? "Conectando..."
                : "Reconectando..."}
          </span>
        </header>

        {error && (
          <div className="tickets-alert" role="alert">
            {error}
            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Fechar aviso"
            >
              ×
            </button>
          </div>
        )}

        <section className="tickets-workspace">
          <TicketList
            tickets={tickets}
            filter={filter}
            onFilterChange={setFilter}
            selectedId={selectedId}
            unreadTicketIds={unreadTicketIds}
            loading={loadingTickets}
            onSelect={setSelectedId}
            onRefresh={loadTickets}
          />

          <TicketConversation
            ticket={selectedTicket}
            messages={messages}
            nextCursor={nextCursor}
            loading={loadingMessages}
            loadingOlder={loadingOlder}
            draft={draft}
            sending={sending}
            updatingStatus={updatingStatus}
            messagesEndRef={messagesEndRef}
            onLoadOlder={loadOlderMessages}
            onDraftChange={setDraft}
            onSend={sendMessage}
            onChangeStatus={changeTicketStatus}
          />
        </section>
      </main>
    </div>
  );
}
