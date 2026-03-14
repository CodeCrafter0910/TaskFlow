import api from "./api";
import { User } from "@/types";
import CryptoJS from "crypto-js";

const AES_KEY = process.env.NEXT_PUBLIC_AES_SECRET_KEY || "";

const decryptUser = (encryptedPayload: { encrypted: string }): User => {
  const bytes = CryptoJS.AES.decrypt(encryptedPayload.encrypted, AES_KEY);
  const raw = bytes.toString(CryptoJS.enc.Utf8);
  return JSON.parse(raw) as User;
};

export const authApi = {
  register: async (name: string, email: string, password: string): Promise<User> => {
    const res = await api.post("/auth/register", { name, email, password });
    return decryptUser(res.data.user);
  },

  login: async (email: string, password: string): Promise<User> => {
    const res = await api.post("/auth/login", { email, password });
    return decryptUser(res.data.user);
  },

  logout: async (): Promise<void> => {
    await api.post("/auth/logout");
  },

  getMe: async (): Promise<User> => {
    const res = await api.get("/auth/me");
    return decryptUser(res.data.user);
  },
};
