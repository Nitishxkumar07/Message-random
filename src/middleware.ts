import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextResponse } from "next/server";

// Use the Edge-safe config here — no bcryptjs, no mongoose
const { auth } = NextAuth(authConfig);

export default auth((req) => {
    const token = req.auth;
    const { pathname } = req.nextUrl;

    const isAuth = !!token;
    const isAuthPage =
        pathname.startsWith("/sign-in") ||
        pathname.startsWith("/sign-up") ||
        pathname.startsWith("/verify");

    // 1. Logged in user → auth pages pe aaye → dashboard redirect
    if (isAuth && isAuthPage) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // 2. Logged out user → dashboard pe aaye → sign-in redirect
    if (!isAuth && pathname.startsWith("/dashboard")) {
        return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    // 3. Baaki sab allow
    return NextResponse.next();
});

export const config = {
    matcher: [
        "/sign-in",
        "/sign-up",
        "/",
        "/dashboard/:path*",
        "/verify/:path*",
    ],
};
