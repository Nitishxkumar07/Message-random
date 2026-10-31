import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/dbConnect";
import UserModel from "@/model/User";

export const { handlers, auth, signIn, signOut } = NextAuth({
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/sign-in",
    },
    providers: [
        Credentials({
            name: "Credentials",
            credentials: {
                identifier: { label: "Email or Username", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials): Promise<any> {
                if (!credentials?.identifier || !credentials?.password) {
                    throw new Error("Email/username and password are required");
                }

                await dbConnect();

                const user = await UserModel.findOne({
                    $or: [
                        { email: credentials.identifier },
                        { username: credentials.identifier },
                    ],
                });

                if (!user) {
                    throw new Error("User not found");
                }

                if (!user.isVerified) {
                    throw new Error("Please verify your account before login");
                }

                const isPasswordCorrect = await bcrypt.compare(
                    credentials.password as string,
                    user.password
                );

                if (!isPasswordCorrect) {
                    throw new Error("Incorrect password");
                }

                return {
                    _id: user._id.toString(),
                    email: user.email,
                    username: user.username,
                    isVerified: user.isVerified,
                    isAcceptingMessages: user.isAcceptingMessages,
                };
            },
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
});

