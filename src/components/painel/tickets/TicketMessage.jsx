function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleString("pt-BR");
}

export default function TicketMessage({ message }) {
  const isStaff = message.author_type === "staff" || message.source === "painel";

  return (
    <article
      className={`ticket-message${isStaff ? " is-painel" : ""}`}
    >
      {message.author_avatar && <img src={message.author_avatar} alt="" />}
      <div className="ticket-message-bubble">
        <div className="ticket-message-meta">
          <strong>{message.author_name || (isStaff ? "Atendente" : "Cliente")}</strong>
          <time dateTime={message.created_at}>{formatDate(message.created_at)}</time>
          {message.delivery_status === "pending" && (
            <span className="ticket-delivery-pending">Aguardando bot</span>
          )}
          {message.delivery_status === "failed" && (
            <span className="ticket-delivery-failed">Falha na entrega</span>
          )}
        </div>
        {message.content && <p>{message.content}</p>}
        {message.attachments?.map((attachment) => (
          <a
            href={attachment.url}
            target="_blank"
            rel="noreferrer"
            key={attachment.url}
          >
            {attachment.filename || attachment.name || "Abrir anexo"}
          </a>
        ))}
      </div>
    </article>
  );
}
