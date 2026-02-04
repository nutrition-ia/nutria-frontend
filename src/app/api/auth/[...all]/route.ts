import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

// Better Auth route handler para Next.js
// Processa todas as rotas de autenticação: /api/auth/*
export const { GET, POST } = toNextJsHandler(auth);
