const USER_EMAIL_DOMAIN = "users.dvsweb.internal";

export function normalizeUsername(username) {
  return username.trim().toLowerCase();
}

export function usernameToAuthEmail(username) {
  return `${normalizeUsername(username)}@${USER_EMAIL_DOMAIN}`;
}