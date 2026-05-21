import axios from "axios";

export const api = axios.create({
  baseURL:
    "https://subheader-clock-shadily.ngrok-free.dev",

  headers: {
    "ngrok-skip-browser-warning":
      "true",
  },
});

// ngrok http 3001