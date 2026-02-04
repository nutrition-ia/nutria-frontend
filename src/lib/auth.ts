import { betterAuth } from "better-auth";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

// Cria diretório de dados se não existir (para development)
const dataDir = path.join(process.cwd(), ".auth-data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "auth.db");
const db = new Database(dbPath);

/**
 * Configuração do Better Auth no Next.js
 * Esta é a abordagem recomendada - auth no mesmo servidor que o frontend
 */
export const auth = betterAuth({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  database: db,

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 dias
    updateAge: 60 * 60 * 24, // 1 dia
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutos
    },
  },

  user: {
    additionalFields: {
      planType: {
        type: "string",
        required: false,
        defaultValue: "free",
        input: true,
      },
      avatarUrl: {
        type: "string",
        required: false,
        input: true,
      },
    },
  },

  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
    cookieOptions: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    },
  },

  rateLimit: {
    enabled: true,
    window: 60,
    max: 10,
  },
});
