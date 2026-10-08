import { fireEvent, render, screen } from "@testing-library/react";

import TicketConversation from "./TicketConversation";
import TicketList, { getTicketCategory } from "./TicketList";

test("classifies an open ticket awaiting the team from the customer's last message", () => {
  const ticket = {
    id: "ticket-1",
    status: "open",
    last_message: { source: "discord" },
  };

  expect(getTicketCategory(ticket)).toBe("waiting");
  expect(
    getTicketCategory({
      ...ticket,
      last_message: { source: "painel" },
    }),
  ).toBe("open");
  expect(
    getTicketCategory({
      ...ticket,
      last_message: { source: "discord", author_type: "staff" },
    }),
  ).toBe("open");
  expect(getTicketCategory({ ...ticket, status: "closed" })).toBe("closed");
});

test("shows customer details, latest message and unread state in the list", () => {
  render(
    <TicketList
      tickets={[
        {
          id: "ticket-1",
          status: "open",
          ticket_name: "Ajuda com acesso",
          customer_name: "Ana",
          discord_channel_id: "123",
          updated_at: "2026-10-08T12:00:00.000Z",
          last_message: {
            source: "discord",
            content: "Não consigo entrar",
            created_at: "2026-10-08T12:00:00.000Z",
          },
        },
      ]}
      filter="waiting"
      onFilterChange={() => {}}
      selectedId="ticket-1"
      unreadTicketIds={new Set(["ticket-1"])}
      loading={false}
      onSelect={() => {}}
      onRefresh={() => {}}
    />,
  );

  expect(screen.getByRole("button", { name: /Ajuda com acesso/ })).toBeInTheDocument();
  expect(screen.getByText("Ana")).toBeInTheDocument();
  expect(screen.getByText("Não consigo entrar")).toBeInTheDocument();
  expect(screen.getByText("Não lido")).toBeInTheDocument();
});

test("disables sending for a closed ticket and renders available attachments", () => {
  render(
    <TicketConversation
      ticket={{
        id: "ticket-1",
        status: "closed",
        ticket_name: "Dúvida",
        discord_channel_id: "123",
      }}
      messages={[
        {
          id: "message-1",
          author_type: "user",
          author_name: "Ana",
          created_at: "2026-10-08T12:00:00.000Z",
          attachments: [{ url: "https://example.com/file.png", filename: "file.png" }],
        },
      ]}
      nextCursor={null}
      loading={false}
      loadingOlder={false}
      draft="Resposta"
      sending={false}
      updatingStatus={false}
      messagesEndRef={{ current: null }}
      onLoadOlder={() => {}}
      onDraftChange={() => {}}
      onSend={(event) => event.preventDefault()}
      onChangeStatus={() => {}}
    />,
  );

  expect(screen.getByRole("button", { name: "Reabrir ticket" })).toBeEnabled();
  expect(screen.getByRole("textbox")).toBeDisabled();
  expect(screen.getByRole("button", { name: "Enviar" })).toBeDisabled();
  expect(screen.getByRole("link", { name: "file.png" })).toHaveAttribute(
    "href",
    "https://example.com/file.png",
  );
});
