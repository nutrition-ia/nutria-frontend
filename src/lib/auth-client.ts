import { createAuthClient } from "better-auth/react";
import { jwtClient } from "better-auth/client/plugins";

/**
 * Cliente do Better Auth para o frontend Next.js
 * Usa JWT plugin para gerar tokens que são validados por backend e catalog
 */
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  plugins: [jwtClient()],
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
