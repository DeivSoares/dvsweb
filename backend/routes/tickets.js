const express = require("express");
const { db } = require("../firebase");

const router = express.Router();
const TICKETS = "tickets";
const OUTBOX = "ticket_outbox";
const MAX_MESSAGE_LENGTH = 2000;

function isSnowflake(value) {
  return typeof value === "string" && /^\d{1,32}$/.test(value);
}

function serializeDocument(doc) {
  return { id: doc.id, ...doc.data() };
}

function getActor(req) {
  const user = req.user;
  const name =
    user.name ||
    user.username ||
    (typeof user.email === "string" ? user.email.split("@")[0] : "") ||
    "Atendente";

  return {
    author_id: user.uid,
    author_name: String(name).slice(0, 100),
    author_avatar:
      typeof user.picture === "string" && user.picture.startsWith("https://")
        ? user.picture
        : null,
  };
}

function emit(io, event, payload) {
  io?.to("tickets").emit(event, payload);
}

function parseLimit(value, fallback, maximum) {
  if (value === undefined) return fallback;
  const limit = Number(value);
  return Number.isInteger(limit) && limit >= 1 && limit <= maximum
    ? limit
    : null;
}

router.get("/", async (req, res) => {
  const { status } = req.query;
  if (status !== undefined && !["open", "closed"].includes(status)) {
    return res.status(400).json({ error: "Status inválido." });
  }

  try {
    let query = db.collection(TICKETS);
    if (status) {
      query = query.where("status", "==", status);
    } else {
      query = query.orderBy("updated_at", "desc");
    }

    const snapshot = await query.limit(100).get();
    const tickets = snapshot.docs.map(serializeDocument);
    if (status) {
      tickets.sort((a, b) =>
        (b.updated_at || "").localeCompare(a.updated_at || ""),
      );
    }
    return res.json(tickets);
  } catch (error) {
    console.error("Erro ao listar tickets:", error);
    return res.status(500).json({ error: "Não foi possível listar os tickets." });
  }
});

router.get("/:ticketId", async (req, res) => {
  if (!isSnowflake(req.params.ticketId)) {
    return res.status(400).json({ error: "ID de ticket inválido." });
  }

  try {
    const snapshot = await db.collection(TICKETS).doc(req.params.ticketId).get();
    if (!snapshot.exists) {
      return res.status(404).json({ error: "Ticket não encontrado." });
    }
    return res.json(serializeDocument(snapshot));
  } catch (error) {
    console.error("Erro ao consultar ticket:", error);
    return res.status(500).json({ error: "Não foi possível consultar o ticket." });
  }
});

router.get("/:ticketId/messages", async (req, res) => {
  if (!isSnowflake(req.params.ticketId)) {
    return res.status(400).json({ error: "ID de ticket inválido." });
  }

  const limit = parseLimit(req.query.limit, 50, 100);
  if (!limit) {
    return res.status(400).json({ error: "O limite deve estar entre 1 e 100." });
  }

  const before = req.query.before;
  const after = req.query.after;
  if (before !== undefined && after !== undefined) {
    return res.status(400).json({
      error: "Informe somente um cursor de paginação.",
    });
  }
  const cursorValue = before ?? after;
  if (
    cursorValue !== undefined &&
    (typeof cursorValue !== "string" ||
      !/^[A-Za-z0-9_-]{1,150}$/.test(cursorValue))
  ) {
    return res.status(400).json({ error: "Cursor de mensagens inválido." });
  }

  try {
    const ticketRef = db.collection(TICKETS).doc(req.params.ticketId);
    const ticket = await ticketRef.get();
    if (!ticket.exists) {
      return res.status(404).json({ error: "Ticket não encontrado." });
    }

    const messagesRef = ticketRef.collection("messages");
    const isSync = after !== undefined;
    let query = messagesRef.orderBy("created_at", isSync ? "asc" : "desc");
    if (cursorValue !== undefined) {
      const cursor = await messagesRef.doc(cursorValue).get();
      if (!cursor.exists) {
        return res.status(400).json({ error: "Cursor de mensagens inválido." });
      }
      query = query.startAfter(cursor);
    }

    const snapshot = await query.limit(limit + 1).get();
    const page = snapshot.docs.slice(0, limit);
    const messages = page.map(serializeDocument);
    if (!isSync) messages.reverse();
    const nextPage = page[page.length - 1];
    return res.json({
      messages,
      nextCursor: snapshot.size > limit ? nextPage.id : null,
    });
  } catch (error) {
    console.error("Erro ao consultar mensagens do ticket:", error);
    return res.status(500).json({
      error: "Não foi possível consultar as mensagens do ticket.",
    });
  }
});

router.post("/:ticketId/messages", async (req, res) => {
  if (!isSnowflake(req.params.ticketId)) {
    return res.status(400).json({ error: "ID de ticket inválido." });
  }

  const content =
    typeof req.body?.content === "string" ? req.body.content.trim() : "";
  if (!content || content.length > MAX_MESSAGE_LENGTH) {
    return res.status(400).json({
      error: `A mensagem deve conter entre 1 e ${MAX_MESSAGE_LENGTH} caracteres.`,
    });
  }

  try {
    const ticketRef = db.collection(TICKETS).doc(req.params.ticketId);
    const now = new Date().toISOString();
    const actor = getActor(req);
    const outboxRef = db.collection(OUTBOX).doc();
    const messageRef = ticketRef.collection("messages").doc(`panel_${outboxRef.id}`);
    const message = {
      id: messageRef.id,
      ticket_id: ticketRef.id,
      discord_message_id: null,
      ...actor,
      author_type: "staff",
      content,
      attachments: [],
      source: "painel",
      created_at: now,
      delivery_status: "pending",
    };

    await db.runTransaction(async (transaction) => {
      const ticketSnapshot = await transaction.get(ticketRef);
      if (!ticketSnapshot.exists) {
        throw new Error("TICKET_NOT_FOUND");
      }

      const ticket = ticketSnapshot.data();
      if (ticket.status !== "open") {
        throw new Error("TICKET_CLOSED");
      }

      transaction.set(messageRef, message);
      transaction.set(outboxRef, {
        id: outboxRef.id,
        ticket_id: ticketRef.id,
        discord_channel_id: ticket.discord_channel_id,
        discord_guild_id: ticket.discord_guild_id,
        message_id: messageRef.id,
        content,
        attachments: [],
        ...actor,
        created_at: now,
        status: "pending",
        claim_token: null,
      });
      transaction.update(ticketRef, {
        updated_at: now,
        last_message: {
          id: messageRef.id,
          content,
          author_id: actor.author_id,
          author_name: actor.author_name,
          author_type: "staff",
          source: "painel",
          created_at: now,
        },
      });
    });

    emit(req.app.get("io"), "ticket:message", message);
    return res.status(202).json({
      message,
      delivery: "pending",
      outbox_id: outboxRef.id,
    });
  } catch (error) {
    if (error.message === "TICKET_NOT_FOUND") {
      return res.status(404).json({ error: "Ticket não encontrado." });
    }
    if (error.message === "TICKET_CLOSED") {
      return res.status(409).json({ error: "O ticket está fechado." });
    }
    console.error("Erro ao enviar mensagem do painel:", error);
    return res.status(500).json({ error: "Não foi possível enviar a mensagem." });
  }
});

async function updateTicketStatus(req, res, status) {
  if (!isSnowflake(req.params.ticketId)) {
    return res.status(400).json({ error: "ID de ticket inválido." });
  }

  try {
    const ticketRef = db.collection(TICKETS).doc(req.params.ticketId);
    const now = new Date().toISOString();
    const closedAt = status === "closed" ? now : null;
    const updated = await db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(ticketRef);
      if (!snapshot.exists) {
        throw new Error("TICKET_NOT_FOUND");
      }

      transaction.update(ticketRef, {
        status,
        closed_at: closedAt,
        updated_at: now,
      });
      return {
        id: snapshot.id,
        ...snapshot.data(),
        status,
        closed_at: closedAt,
        updated_at: now,
      };
    });

    emit(req.app.get("io"), "ticket:updated", updated);
    return res.json(updated);
  } catch (error) {
    if (error.message === "TICKET_NOT_FOUND") {
      return res.status(404).json({ error: "Ticket não encontrado." });
    }
    console.error("Erro ao atualizar status do ticket:", error);
    return res.status(500).json({
      error: "Não foi possível atualizar o status do ticket.",
    });
  }
}

router.patch("/:ticketId/close", (req, res) =>
  updateTicketStatus(req, res, "closed"),
);
router.patch("/:ticketId/reopen", (req, res) =>
  updateTicketStatus(req, res, "open"),
);

module.exports = router;
