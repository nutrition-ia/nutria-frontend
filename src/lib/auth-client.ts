import { createAuthClient } from "better-auth/react";

/**
 * Cliente do Better Auth para o frontend Next.js
 * Agora usa as rotas locais do Next.js (/api/auth/*)
 * Esta é a abordagem recomendada pelo Better Auth
 */
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});

// Hooks e funções exportadas para uso nos componentes
export const {
  // Hooks
  useSession,

  // Métodos de autenticação
  signIn,
  signUp,
  signOut,

  // Outros
  $fetch,
} = authClient;

// Tipos do usuário
export interface User {
  id: string;
  email: string;
  name: string;
  planType?: string;
  avatarUrl?: string;
  createdAt?: Date;
}

export interface Session {
  user: User;
  session: {
    expiresAt: Date;
  };
}
