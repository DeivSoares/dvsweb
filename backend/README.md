# Integração de atendimento do DvS

A API mantém os tickets e o histórico no Firestore. Tickets usam o ID do canal
Discord como ID do documento em `tickets`; as mensagens ficam na subcoleção
`tickets/{channelId}/messages`. Mensagens enviadas pelo painel são guardadas
junto com um item durável em `ticket_outbox`.

## Configuração

Configure `BOT_API_KEY` no ambiente da API e do bot com o mesmo valor aleatório
forte. Não envie essa chave ao frontend nem a armazene no repositório. Configure
`PANEL_ORIGIN` com as origens HTTPS do painel separadas por vírgula. A API também
continua precisando da credencial Firebase Admin em `config/firebase.json`.

Use `.env.example` como referência para as novas variáveis. No deploy, configure
as variáveis no painel do provedor, em vez de incluir `.env` no artefato público.

## Endpoints do painel

Todas as rotas abaixo exigem `Authorization: Bearer <Firebase ID token>`.

| Método | Caminho | Uso |
| --- | --- | --- |
| `GET` | `/tickets?status=open\|closed` | Listar até 100 tickets |
| `GET` | `/tickets/:ticketId` | Consultar ticket pelo ID do canal |
| `GET` | `/tickets/:ticketId/messages?limit=50&before=...` | Consultar mensagens anteriores |
| `GET` | `/tickets/:ticketId/messages?limit=100&after=...` | Sincronizar mensagens novas após reconectar |
| `POST` | `/tickets/:ticketId/messages` | Enfileirar mensagem do painel |
| `PATCH` | `/tickets/:ticketId/close` | Fechar ticket |
| `PATCH` | `/tickets/:ticketId/reopen` | Reabrir ticket |

O corpo de envio do painel é `{ "content": "..." }`; a resposta `202` significa
que a mensagem foi persistida e aguarda entrega pelo bot.

## Protocolo do bot

Todas as rotas `/bot/tickets/*` exigem o header `X-API-Key` com `BOT_API_KEY`.

O bot cria/sincroniza tickets com `POST /bot/tickets` e os fecha com
`PATCH /bot/tickets/:ticketId` (`{ "status": "closed" }`). Ao receber uma
mensagem do Discord, faça `POST
   /bot/tickets/messages` com `discord_channel_id`, `discord_guild_id`,
   `discord_message_id`, `author_id`, `author_name` e `author_type` (`user`,
   `staff` ou `bot`),
   `source: "discord"` (`"bot"` para mensagens com `author_type: "bot"`),
   `content` e, se houver, `attachments`. Envie também
   `ticket_name` (opcional) para exibir o nome do canal/ticket no painel.

Conecte ao Socket.IO da API usando `auth: { apiKey: BOT_API_KEY }`. Ao
   conectar ou receber `ticket:message` com `source: "painel"`, consulte
   `GET /bot/tickets/outbox?limit=10` para buscar os envios duráveis. Cada item contém
   `id`, `claim_token`, `discord_channel_id`, `content` e metadados do atendente.
   A reserva expira após um minuto e pode ser buscada novamente se o bot falhar.
Envie a mensagem do item para o canal Discord e confirme com
   `POST /bot/tickets/outbox/:id/ack`, enviando
   `{ "claim_token": "...", "discord_message_id": "..." }`.
   A confirmação atualiza a mensagem original no histórico. Itens não
   confirmados podem ser recuperados depois que a reserva expirar.

IDs Discord devem ser strings numéricas. Mensagens repetidas com o mesmo
`discord_message_id` são ignoradas. O bot deve guardar os itens que retirou da
outbox até enviá-los e confirmar, e tratar uma reserva expirada como uma
possível repetição de entrega.

## Eventos em tempo real

O Socket.IO compartilha o servidor HTTP da API. O painel conecta enviando
`auth: { token: "<Firebase ID token>" }`; sockets sem token válido são
recusados. Eventos emitidos após persistência:

- `ticket:message`: mensagem nova ou atualização de estado de entrega;
- `ticket:updated`: ticket fechado ou reaberto.

O bot também pode conectar enviando `auth: { apiKey: BOT_API_KEY }`. Essa
credencial é validada no handshake e nunca deve ser usada no frontend. A API
emite mensagens de ticket pelo Socket.IO, enquanto o Firestore e a outbox
continuam sendo a fonte persistente; após cada reconexão, o bot deve drenar a
outbox antes de aguardar novos eventos.

Na paginação, as mensagens são retornadas em ordem cronológica. `before` busca
mensagens antigas; `after` busca mensagens posteriores ao ID indicado. Quando
`nextCursor` não é `null`, use-o como cursor da próxima página na mesma direção.
O campo `last_message.id` identifica a mensagem mais recente do ticket.
