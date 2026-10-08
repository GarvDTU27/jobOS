import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "../db/prisma";
import { verifyPassword } from "./password";

export async function authorizeCredentials(credentials) {
  if (!credentials?.email || !credentials?.password) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { email: credentials.email },
  });

  if (!user || !user.passwordHash) {
    return null;
  }

  const isPasswordValid = await verifyPassword(
    credentials.password,
    user.passwordHash
  );

  if (!isPasswordValid) {
    return null;
  }

  // Return user without password hash
  return {
    id: user.id,
    email: user.email,
    name: user.name,
  };
}

export const authConfig = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: authorizeCredentials,
    }),
  ],
  callbacks: {
    async session({ session, user, token }) {
      if (session?.user && user?.id) {
        session.user.id = user.id;
      } else if (session?.user && token?.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    }
  },
};
