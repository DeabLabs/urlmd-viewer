import { parseEnv } from "znv";
import { z } from "zod";

export const { URLMD_BASE_URL, BASE_URL } = parseEnv(process.env, {
  URLMD_BASE_URL: z.string().url().default("http://localhost:8080"),
  BASE_URL: z.string().url().default("http://localhost:5173"),
});
