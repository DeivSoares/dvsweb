import axios from "axios";

export const api = axios.create({
  baseURL: "https://subheader-clock-shadily.ngrok-free.dev",
});