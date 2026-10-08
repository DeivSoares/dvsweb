import TicketMessage from "./TicketMessage";

function getTicketName(ticket) {
  return (
    ticket.ticket_name ||
    ticket.name ||
    ticket.title ||
    `Ticket #${ticket.discord_channel_id}`
  );
}

export default function TicketConversation({
  ticket,
  messages,
  nextCursor,
  loading,
  loadingOlder,
  draft,
  sending,
  updatingStatus,
  messagesEndRef,
  onLoadOlder,
  onDraftChange,
  onSend,
  onChangeStatus,
}) {
  if (!ticket) {
    return (
      <section className="ticket-conversation" aria-label="Conversa do ticket">
        <div className="tickets-no-selection">
          <span aria-hidden="true">◌</span>
          <h2>Selecione um ticket</h2>
          <p>As conversas do Discord aparecerão aqui.</p>
        </div>
      </section>
    );
  }

  const isOpen = ticket.status === "open";
  const latestFromCustomer =
    ticket.last_message?.author_type === "user" ||
    (ticket.last_message?.author_type === undefined &&
      ticket.last_message?.source === "discord");
  const customerName =
    ticket.customer_name ||
    ticket.cliente_name ||
    ticket.client_name ||
    (latestFromCustomer
      ? ticket.last_message.author_name
      : "Cliente Discord");
  const customerId =
    ticket.customer_discord_id ||
    ticket.cliente_id ||
    (latestFromCustomer
      ? ticket.last_message.author_id
      : null);

  return (
    <section className="ticket-conversation" aria-label="Conversa do ticket">
      <header className="ticket-conversation-header">
        <div>
          <h2>{getTicketName(ticket)}</h2>
          <p>
            {customerName}
            {customerId ? ` (${customerId})` : ""} · Canal {ticket.discord_channel_id}
            {ticket.discord_guild_id ? ` · Servidor ${ticket.discord_guild_id}` : ""}
          </p>
        </div>
        <button
          className="ticket-status-action"
          type="button"
          disabled={updatingStatus}
          onClick={onChangeStatus}
        >
          {updatingStatus ? "Atualizando..." : isOpen ? "Fechar ticket" : "Reabrir ticket"}
        </button>
      </header>

      <div className="ticket-messages" aria-live="polite" aria-busy={loading}>
        {nextCursor && (
          <button
            className="ticket-load-older"
            type="button"
            disabled={loadingOlder}
            onClick={onLoadOlder}
          >
            {loadingOlder ? "Carregando..." : "Carregar mensagens anteriores"}
          </button>
        )}
        {loading && <p className="tickets-empty">Carregando conversa...</p>}
        {!loading && messages.length === 0 && (
          <p className="tickets-empty">Ainda não há mensagens neste ticket.</p>
        )}
        {messages.map((message) => (
          <TicketMessage key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form className="ticket-composer" onSubmit={onSend}>
        <textarea
          value={draft}
          onChange={(event) => onDraftChange(event.target.value)}
          placeholder={isOpen ? "Escreva uma mensagem..." : "Reabra o ticket para responder."}
          maxLength={2000}
          disabled={!isOpen || sending}
          rows={2}
        />
        <div>
          <small>{draft.length}/2000</small>
          <button
            type="submit"
            disabled={!isOpen || !draft.trim() || sending}
          >
            {sending ? "Enviando..." : "Enviar"}
          </button>
        </div>
      </form>
    </section>
  );
}
