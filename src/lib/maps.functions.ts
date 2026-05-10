import { createServerFn } from "@tanstack/react-start";

export const getMapsConfig = createServerFn({ method: "GET" }).handler(async () => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_MAPS_API_KEY no configurada");
  return { apiKey };
});