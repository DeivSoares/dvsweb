const crypto = require("crypto");
const express = require("express");
const { FieldValue } = require("firebase-admin/firestore");

const { db } = require("../firebase");
const authenticateBot = require("../middleware/authenticateBot");

const router = express.Router();
const TICKETS = "tickets";
const OUTBOX = "ticket_outbox";
const MAX_CONTENT_LENGTH = 4000;
const MAX_ATTACHMENTS = 10;
const CLAIM_DURATION_MS = 60_000;

router.use(authenticateBot);

function isSnowflake(value) {
  return typeof value === "string" && /^\d{1,32}$/.test(value);
}

router.post("/", async (req, res) => {
  const {
    discord_channel_id: channelId,
    discord_guild_id: guildId,
    customer_discord_id: customerId,
    ticket_name: ticketName,
  } = req.body || {};
  if (
    !isSnowflake(channelId) ||
    !isSnowflake(guildId) ||
    (customerId !== undefined && !isSnowflake(customerId)) ||
    (ticketName !== undefined &&
      (typeof ticketName !== "string" ||
        !ticketName.trim() ||
        ticketName.length > 100))
  ) {
    return res.status(400).json({ error: "Dados do ticket inválidos." });
  }

  try {
    const ticketRef = db.collection(TICKETS).doc(channelId);
    const now = new Date().toISOString();
    const snapshot = await ticketRef.get();
    const ticket = {
      discord_channel_id: channelId,
      discord_guild_id: guildId,
      status: snapshot.exists ? snapshot.data().status : "open",
      ...(snapshot.exists ? {} : { created_at: now, closed_at: null }),
      updated_at: now,
      ...(customerId ? { customer_discord_id: customerId } : {}),
      ...(ticketName ? { ticket_name: ticketName.trim() } : {}),
    };
    await ticketRef.set(ticket, { merge: true });
    const updated = { id: channelId, ...snapshot.data(), ...ticket };
    emit(req.app.get("io"), "ticket:updated", updated);
    return res.status(snapshot.exists ? 200 : 201).json(updated);
  } catch (error) {
    console.error("Erro ao registrar ticket do bot:", error);
    return res.status(500).json({ error: "Não foi possível registrar o ticket." });
  }
});

router.patch("/:ticketId", async (req, res) => {
  const { ticketId } = req.params;
  if (!isSnowflake(ticketId) || req.body?.status !== "closed") {
    return res.status(400).json({ error: "Dados de fechamento inválidos." });
  }

  try {
    const ticketRef = db.collection(TICKETS).doc(ticketId);
    const snapshot = await ticketRef.get();
    if (!snapshot.exists) {
      return res.status(404).json({ error: "Ticket não encontrado." });
    }
    const now = new Date().toISOString();
    const closedAt =
      typeof req.body.closed_at === "string" &&
      !Number.isNaN(Date.parse(req.body.closed_at))
        ? new Date(req.body.closed_at).toISOString()
        : now;
    const updates = {
      status: "closed",
      closed_at: closedAt,
      close_requested: false,
      updated_at: now,
    };
    await ticketRef.update(updates);
    const updated = { id: snapshot.id, ...snapshot.data(), ...updates };
    emit(req.app.get("io"), "ticket:updated", updated);
    return res.json(updated);
  } catch (error) {
    console.error("Erro ao fechar ticket do bot:", error);
    return res.status(500).json({ error: "Não foi possível fechar o ticket." });
  }
});

function isDocumentId(value) {
  return typeof value === "string" && /^[A-Za-z0-9_-]{1,150}$/.test(value);
}

function validateAttachments(value) {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > MAX_ATTACHMENTS) return null;

  const attachments = [];
  for (const item of value) {
    if (
      !item ||
      typeof item !== "object" ||
      typeof item.url !== "string" ||
      item.url.length > 2048 ||
      !isHttpsUrl(item.url) ||
      typeof item.filename !== "string" ||
      !item.filename.trim() ||
      item.filename.length > 255 ||
      (item.content_type !== undefined &&
        (typeof item.content_type !== "string" ||
          item.content_type.length > 120)) ||
      (item.size !== undefined &&
        (!Number.isSafeInteger(item.size) || item.size < 0))
    ) {
      return null;
    }

    attachments.push({
      filename: item.filename.trim(),
      url: item.url,
      content_type: item.content_type || null,
      size: item.size ?? null,
    });
  }
  return attachments;
}

function isHttpsUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password;
  } catch {
    return false;
  }
}

function serializeDocument(doc) {
  return { id: doc.id, ...doc.data() };
}

function emit(io, event, payload) {
  io?.to("tickets").emit(event, payload);
}

router.post("/messages", async (req, res) => {
  const {
    discord_channel_id: channelId,
    discord_guild_id: guildId,
    discord_message_id: discordMessageId,
    author_id: authorId,
    author_name: authorName,
    ticket_name: ticketName,
  } = req.body || {};
  const content = typeof req.body?.content === "string" ? req.body.content : "";
  const source = req.body?.source || "discord";
  const authorType = req.body?.author_type || "user";
  const attachments = validateAttachments(req.body?.attachments);
  if (
    ticketName !== undefined &&
    (typeof ticketName !== "string" || !ticketName.trim() || ticketName.length > 100)
  ) {
    return res.status(400).json({ error: "Nome do ticket inválido." });
  }

  if (
    !isSnowflake(channelId) ||
    !isSnowflake(guildId) ||
    !isSnowflake(discordMessageId) ||
    !isSnowflake(authorId) ||
    typeof authorName !== "string" ||
    !authorName.trim() ||
    authorName.length > 100 ||
    content.length > MAX_CONTENT_LENGTH ||
    (!content.trim() && attachments?.length === 0) ||
    !["discord", "bot"].includes(source) ||
    !["user", "staff", "bot"].includes(authorType) ||
    (source === "bot") !== (authorType === "bot") ||
    attachments === null
  ) {
    return res.status(400).json({ error: "Dados da mensagem inválidos." });
  }

  const outboxId = req.body?.outbox_id;
  if (outboxId !== undefined && !isDocumentId(outboxId)) {
    return res.status(400).json({ error: "Identificador de outbox inválido." });
  }

  const clientId = req.body?.cliente_id;
  if (
    clientId !== undefined &&
    clientId !== null &&
    (typeof clientId !== "string" || !clientId.trim() || clientId.length > 128)
  ) {
    return res.status(400).json({ error: "Identificador do cliente inválido." });
  }

  const suppliedCreatedAt = req.body?.created_at;
  if (
    suppliedCreatedAt !== undefined &&
    (typeof suppliedCreatedAt !== "string" ||
      Number.isNaN(Date.parse(suppliedCreatedAt)))
  ) {
    return res.status(400).json({ error: "Data da mensagem inválida." });
  }

  const avatar = req.body?.author_avatar;
  if (
    avatar !== undefined &&
    avatar !== null &&
    (typeof avatar !== "string" ||
      avatar.length > 2048 ||
      !isHttpsUrl(avatar))
  ) {
    return res.status(400).json({ error: "Avatar inválido." });
  }

  try {
    const ticketRef = db.collection(TICKETS).doc(channelId);
    const messagesRef = ticketRef.collection("messages");
    const messageRef = messagesRef.doc(`discord_${discordMessageId}`);
    const duplicateQuery = messagesRef
      .where("discord_message_id", "==", discordMessageId)
      .limit(1);
    const now = new Date().toISOString();
    const message = {
      id: messageRef.id,
      ticket_id: channelId,
      discord_message_id: discordMessageId,
      author_id: authorId,
      author_name: authorName.trim(),
      author_avatar: avatar || null,
      author_type: authorType,
      content,
      attachments,
      source,
      created_at: suppliedCreatedAt
        ? new Date(suppliedCreatedAt).toISOString()
        : now,
    };

    const outboxRef = outboxId
      ? db.collection(OUTBOX).doc(outboxId)
      : null;
    const panelMessageRef = outboxRef
      ? messagesRef.doc(`panel_${outboxId}`)
      : null;

    const result = await db.runTransaction(async (transaction) => {
      const [ticketSnapshot, deterministicMessage, duplicateSnapshot] =
        await Promise.all([
          transaction.get(ticketRef),
          transaction.get(messageRef),
          transaction.get(duplicateQuery),
        ]);

      let outboxSnapshot = null;
      let panelMessageSnapshot = null;
      if (outboxRef && panelMessageRef) {
        [outboxSnapshot, panelMessageSnapshot] = await Promise.all([
          transaction.get(outboxRef),
          transaction.get(panelMessageRef),
        ]);
        if (
          !outboxSnapshot.exists ||
          outboxSnapshot.data().ticket_id !== channelId
        ) {
          const error = new Error("OUTBOX_NOT_FOUND");
          throw error;
        }
      }

      const existingMessage =
        panelMessageSnapshot?.exists
          ? panelMessageSnapshot
          : duplicateSnapshot.empty
            ? deterministicMessage.exists
              ? deterministicMessage
              : null
            : duplicateSnapshot.docs[0];
      const isNew = !existingMessage;

      if (
        ticketSnapshot.exists &&
        ticketSnapshot.data().discord_guild_id !== guildId
      ) {
        const error = new Error("TICKET_GUILD_MISMATCH");
        throw error;
      }

      const ticketUpdate = {
        ...(ticketSnapshot.exists
          ? {}
          : {
              discord_channel_id: channelId,
              discord_guild_id: guildId,
              cliente_id:
                typeof clientId === "string" ? clientId.trim() : null,
              status: "open",
              created_at: now,
              closed_at: null,
          }),
        ...(ticketName ? { ticket_name: ticketName.trim() } : {}),
        ...(authorType === "user"
          ? {
              customer_name: authorName.trim(),
              customer_discord_id: authorId,
            }
          : {}),
        ...(isNew
          ? {
              updated_at: now,
              last_message: {
                id: message.id,
                content,
                author_id: message.author_id,
                author_name: message.author_name,
                author_type: authorType,
                source,
                created_at: message.created_at,
              },
            }
          : {}),
      };

      if (panelMessageSnapshot?.exists) {
        transaction.update(panelMessageRef, {
          discord_message_id: discordMessageId,
          delivery_status: "sent",
        });
      } else if (isNew) {
        transaction.set(messageRef, message);
      }

      if (outboxRef) {
        transaction.update(outboxRef, {
          status: "sent",
          discord_message_id: discordMessageId,
          sent_at: now,
          claim_token: null,
          claim_expires_at: FieldValue.delete(),
        });
      }

      if (Object.keys(ticketUpdate).length) {
        transaction.set(ticketRef, ticketUpdate, { merge: true });
      }

      return {
        duplicate: !isNew,
        message: panelMessageSnapshot?.exists
          ? {
              ...panelMessageSnapshot.data(),
              discord_message_id: discordMessageId,
              delivery_status: "sent",
            }
          : isNew
            ? message
            : serializeDocument(existingMessage),
      };
    });

    if (!result.duplicate) {
      emit(req.app.get("io"), "ticket:message", result.message);
    } else if (outboxRef) {
      emit(req.app.get("io"), "ticket:message", result.message);
    }

    return res.status(result.duplicate ? 200 : 201).json(result);
  } catch (error) {
    if (error.message === "OUTBOX_NOT_FOUND") {
      return res.status(404).json({ error: "Mensagem de saída não encontrada." });
    }
    if (error.message === "TICKET_GUILD_MISMATCH") {
      return res.status(409).json({ error: "O canal já está associado a outro servidor." });
    }
    console.error("Erro ao receber mensagem do Discord:", error);
    return res.status(500).json({
      error: "Não foi possível armazenar a mensagem.",
    });
  }
});

router.get("/outbox", async (req, res) => {
  const limit =
    req.query.limit === undefined ? 10 : Number(req.query.limit);
  if (!Number.isInteger(limit) || limit < 1 || limit > 25) {
    return res.status(400).json({ error: "O limite deve estar entre 1 e 25." });
  }

  try {
    const outbox = db.collection(OUTBOX);
    const nowIso = new Date().toISOString();
    const [pendingSnapshot, processingSnapshot] = await Promise.all([
      outbox.where("status", "==", "pending").limit(100).get(),
      outbox.where("claim_expires_at", "<=", nowIso).limit(100).get(),
    ]);
    const now = Date.now();
    const candidates = [
      ...pendingSnapshot.docs,
      ...processingSnapshot.docs.filter(
        (doc) =>
          doc.data().status === "processing" &&
          Date.parse(doc.data().claim_expires_at || "") <= now,
      ),
    ]
      .filter((doc) => doc.data().status !== "cancelled")
      .sort((a, b) =>
        (a.data().created_at || "").localeCompare(b.data().created_at || ""),
      )
      .slice(0, limit);

    const messages = [];
    for (const candidate of candidates) {
      const claimToken = crypto.randomUUID();
      const claimExpiresAt = new Date(now + CLAIM_DURATION_MS).toISOString();
      const claimed = await db.runTransaction(async (transaction) => {
        const current = await transaction.get(candidate.ref);
        if (!current.exists) return null;
        const data = current.data();
        const isPending = data.status === "pending";
        const leaseExpired =
          data.status === "processing" &&
          Date.parse(data.claim_expires_at || "") <= Date.now();
        if (!isPending && !leaseExpired) return null;

        transaction.update(candidate.ref, {
          status: "processing",
          claim_token: claimToken,
          claim_expires_at: claimExpiresAt,
        });
        return { ...data, status: "processing", claim_token: claimToken };
      });
      if (claimed) messages.push(claimed);
    }

    return res.json({ messages });
  } catch (error) {
    console.error("Erro ao consultar outbox do bot:", error);
    return res.status(500).json({ error: "Não foi possível consultar a outbox." });
  }
});

router.post("/outbox/:outboxId/ack", async (req, res) => {
  const { outboxId } = req.params;
  const {
    claim_token: claimToken,
    discord_message_id: discordMessageId,
    action,
    transcript_url: transcriptUrl,
  } = req.body || {};
  if (
    !isDocumentId(outboxId) ||
    typeof claimToken !== "string" ||
    claimToken.length > 100 ||
    (action === "transcript_ready"
      ? typeof transcriptUrl !== "string" || !isHttpsUrl(transcriptUrl)
      : action === "channel_deleted" || action === "close_ticket"
        ? transcriptUrl !== undefined &&
          (typeof transcriptUrl !== "string" || !isHttpsUrl(transcriptUrl))
      : !isSnowflake(discordMessageId))
  ) {
    return res.status(400).json({ error: "Confirmação de entrega inválida." });
  }

  try {
    const outboxRef = db.collection(OUTBOX).doc(outboxId);
    const snapshot = await outboxRef.get();
    if (!snapshot.exists) {
      return res.status(404).json({ error: "Mensagem de saída não encontrada." });
    }

    const outboxItem = snapshot.data();
    if (
      outboxItem.status === "sent" &&
      (["channel_deleted", "close_ticket"].includes(action)
        ? outboxItem.type === "close_ticket"
        : outboxItem.discord_message_id === discordMessageId)
    ) {
      return res.json({ success: true, duplicate: true });
    }
    if (
      outboxItem.status !== "processing" ||
      outboxItem.claim_token !== claimToken
    ) {
      return res.status(409).json({ error: "A confirmação não corresponde à reserva atual." });
    }

    const ticketRef = db.collection(TICKETS).doc(outboxItem.ticket_id);
    if (
      outboxItem.type === "close_ticket" &&
      action === "transcript_ready"
    ) {
      await db.runTransaction(async (transaction) => {
        const current = await transaction.get(outboxRef);
        if (!current.exists) {
          const error = new Error("CLOSE_ACTION_NOT_FOUND");
          throw error;
        }
        const currentAction = current.data();
        if (
          currentAction.status !== "processing" ||
          currentAction.claim_token !== claimToken
        ) {
          const error = new Error("OUTBOX_CLAIM_EXPIRED");
          throw error;
        }
        transaction.update(outboxRef, { transcript_url: transcriptUrl });
      });
      return res.json({ success: true, stage: "transcript_ready" });
    }

    if (
      outboxItem.type === "close_ticket" &&
      ["channel_deleted", "close_ticket"].includes(action)
    ) {
      const savedTranscriptUrl = outboxItem.transcript_url || transcriptUrl;
      if (!savedTranscriptUrl || !isHttpsUrl(savedTranscriptUrl)) {
        return res.status(409).json({ error: "O transcript precisa ser salvo antes de apagar o canal." });
      }
      const now = new Date().toISOString();
      const updatedTicket = await db.runTransaction(async (transaction) => {
        const [currentOutbox, currentTicket] = await Promise.all([
          transaction.get(outboxRef),
          transaction.get(ticketRef),
        ]);
        if (!currentOutbox.exists || !currentTicket.exists) {
          const error = new Error("CLOSE_ACTION_NOT_FOUND");
          throw error;
        }
        const currentAction = currentOutbox.data();
        if (
          currentAction.status !== "processing" ||
          currentAction.claim_token !== claimToken
        ) {
          const error = new Error("OUTBOX_CLAIM_EXPIRED");
          throw error;
        }

        transaction.update(outboxRef, {
          status: "sent",
          sent_at: now,
          claim_token: null,
          claim_expires_at: FieldValue.delete(),
          transcript_url: savedTranscriptUrl,
        });
        transaction.update(ticketRef, {
          status: "closed",
          closed_at: now,
          close_requested: false,
          updated_at: now,
          transcript_url: savedTranscriptUrl,
        });
        return {
          id: currentTicket.id,
          ...currentTicket.data(),
          status: "closed",
          closed_at: now,
          close_requested: false,
          updated_at: now,
          transcript_url: savedTranscriptUrl,
        };
      });
      emit(req.app.get("io"), "ticket:updated", updatedTicket);
      return res.json({ success: true, ticket: updatedTicket });
    }

    if (
      outboxItem.type === "close_ticket" ||
      ["transcript_ready", "channel_deleted", "close_ticket"].includes(action)
    ) {
      return res.status(409).json({ error: "Ação de fechamento incompatível." });
    }

    const messageRef = ticketRef.collection("messages").doc(outboxItem.message_id);
    const sentAt = new Date().toISOString();
    const message = await db.runTransaction(async (transaction) => {
      const [currentOutbox, currentMessage] = await Promise.all([
        transaction.get(outboxRef),
        transaction.get(messageRef),
      ]);
      if (!currentOutbox.exists || !currentMessage.exists) {
        const error = new Error("OUTBOX_MESSAGE_NOT_FOUND");
        throw error;
      }
      const currentData = currentOutbox.data();
      if (
        currentData.status !== "processing" ||
        currentData.claim_token !== claimToken
      ) {
        const error = new Error("OUTBOX_CLAIM_EXPIRED");
        throw error;
      }

      const updatedMessage = {
        ...currentMessage.data(),
        discord_message_id: discordMessageId,
        delivery_status: "sent",
      };
      transaction.update(outboxRef, {
        status: "sent",
        discord_message_id: discordMessageId,
        sent_at: sentAt,
        claim_token: null,
        claim_expires_at: FieldValue.delete(),
      });
      transaction.update(messageRef, {
        discord_message_id: discordMessageId,
        delivery_status: "sent",
      });
      return updatedMessage;
    });

    emit(req.app.get("io"), "ticket:message", message);
    return res.json({ success: true, message });
  } catch (error) {
    if (error.message === "OUTBOX_MESSAGE_NOT_FOUND") {
      return res.status(404).json({ error: "Mensagem de saída não encontrada." });
    }
    if (error.message === "OUTBOX_CLAIM_EXPIRED") {
      return res.status(409).json({ error: "A reserva da mensagem expirou." });
    }
    console.error("Erro ao confirmar entrega do bot:", error);
    return res.status(500).json({ error: "Não foi possível confirmar a entrega." });
  }
});

module.exports = router;
