const FILTERS = [
  { id: "open", label: "Abertos" },
  { id: "waiting", label: "Aguardando resposta" },
  { id: "closed", label: "Fechados" },
];

export function getTicketCategory(ticket) {
  if (ticket.status === "closed") return "closed";
  const lastMessage = ticket.last_message;
  const isCustomerMessage =
    lastMessage?.author_type === "user" ||
    (lastMessage?.author_type === undefined &&
      lastMessage?.source === "discord");
  return isCustomerMessage ? "waiting" : "open";
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleString("pt-BR");
}

export default function TicketList({
  tickets,
  filter,
  onFilterChange,
  selectedId,
  unreadTicketIds,
  loading,
  onSelect,
  onRefresh,
}) {
  const filteredTickets = tickets.filter(
    (ticket) => getTicketCategory(ticket) === filter,
  );

  return (
    <aside className="tickets-list-panel">
      <div className="tickets-list-heading">
        <h2>Tickets</h2>
        <span className="tickets-count">{filteredTickets.length}</span>
        <button type="button" onClick={onRefresh} aria-label="Atualizar tickets">
          Atualizar
        </button>
      </div>
      <div className="tickets-filters" role="tablist" aria-label="Filtrar tickets">
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={filter === item.id}
            className={filter === item.id ? "is-selected" : ""}
            onClick={() => onFilterChange(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="tickets-list">
        {loading && <p className="tickets-empty">Carregando tickets...</p>}
        {!loading && filteredTickets.length === 0 && (
          <p className="tickets-empty">Nenhum ticket encontrado.</p>
        )}
        {filteredTickets.map((ticket) => {
          const ticketName =
            ticket.ticket_name ||
            ticket.name ||
            ticket.title ||
            `#${ticket.discord_channel_id}`;
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
          const isUnread = unreadTicketIds.has(ticket.id);

          return (
            <button
              className={`ticket-list-item${selectedId === ticket.id ? " is-active" : ""}`}
              key={ticket.id}
              type="button"
              onClick={() => onSelect(ticket.id)}
            >
              <span className={`ticket-status-dot is-${getTicketCategory(ticket)}`} />
              <span className="ticket-list-copy">
                <strong>{ticketName}</strong>
                <small>
                  {customerName}
                  {customerId ? ` · ${customerId}` : ""}
                </small>
                <span>{ticket.last_message?.content || "Sem mensagens"}</span>
              </span>
              <span className="ticket-list-meta">
                <time dateTime={ticket.last_message?.created_at || ticket.updated_at}>
                  {formatDate(ticket.last_message?.created_at || ticket.updated_at)}
                </time>
                {isUnread && <i className="ticket-unread-indicator">Não lido</i>}
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
