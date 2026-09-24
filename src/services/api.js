import axios from "axios";

import { auth } from "./firebase";

export const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "https://dvsweb.discloud.app",
});

api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;

  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
