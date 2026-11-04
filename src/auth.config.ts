import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

/**
 * Edge-safe auth config — NO Node.js-only imports (no bcryptjs, no mongoose).
 * Middleware imports this file, which runs in the Edge Runtime.
 *
 * The actual `authorize` logic (DB lookup + bcrypt) lives in auth.ts
 * which runs only in Node.js (API routes / Server Components).
 */
export const authConfig: NextAuthConfig = {
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/sign-in",
    },
    providers: [
        // Credentials provider is declared here so NextAuth knows the provider exists,
        // but authorize() is intentionally left out — it runs in auth.ts (Node.js only).
        Credentials({
            name: "Credentials",
            credentials: {
                identifier: { label: "Email or Username", type: "text" },
                password: { label: "Password", type: "password" },
            },
            // authorize is NOT defined here (no bcrypt / mongoose in Edge)
            authorize: async () => null,
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token._id = user._id;
                token.isVerified = user.isVerified;
                token.isAcceptingMessages = user.isAcceptingMessages;
                token.username = user.username;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user._id = token._id as string;
                session.user.isVerified = token.isVerified as boolean;
                session.user.isAcceptingMessages = token.isAcceptingMessages as boolean;
                session.user.username = token.username as string;
            }
            return session;
        },
    },
};

