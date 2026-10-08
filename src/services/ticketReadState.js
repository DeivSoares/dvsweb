const STORAGE_PREFIX = "dvs-ticket-read-state:";

export function readTicketReadState(userId) {
  const stored = window.localStorage.getItem(`${STORAGE_PREFIX}${userId}`);
  if (!stored) return { initialized: false };

  const value = JSON.parse(stored);
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("O estado local de leitura dos tickets é inválido.");
  }
  return value;
}

export function writeTicketReadState(userId, value) {
  window.localStorage.setItem(
    `${STORAGE_PREFIX}${userId}`,
    JSON.stringify(value),
  );
}
