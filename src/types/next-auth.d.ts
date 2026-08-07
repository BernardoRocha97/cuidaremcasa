import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "ENFERMEIRO";
    } & DefaultSession["user"];
  }

  interface User {
    role: "ADMIN" | "ENFERMEIRO";
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: "ADMIN" | "ENFERMEIRO";
  }
}
