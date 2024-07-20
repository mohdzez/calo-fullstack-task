import dotenv from "dotenv";
dotenv.config();

export const PORT = process.env.NODE_PORT || 3000;
export const UNSPLASH_CLIENT_ID =
  process.env.NODE_UNSPLASH_CLIENT_ID ||
  "rhcw3xrQMwTXE7istyNMWD8bFKIp1EvANjBZgYveNfI";
export const REDIS_HOST = process.env.NODE_REDIS_HOST || "localhost";
export const REDIS_PORT = process.env.NODE_REDIS_PORT || 6379;
