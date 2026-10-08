import { io } from "socket.io-client";

import { auth } from "./firebase";
import { api } from "./api";

export async function createTicketSocket() {
  if (!auth.currentUser) {
    throw new Error("A sessão do painel não está autenticada.");
  }

  const token = await auth.currentUser.getIdToken();
  return io(api.defaults.baseURL, {
    auth: { token },
    autoConnect: false,
  });
}
