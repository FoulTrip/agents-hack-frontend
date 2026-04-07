import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import type { NextAuthConfig } from "next-auth"

const BACKEND_URL = process.env.BACKEND_URL!;

export const authConfig = {
    secret: process.env.AUTH_SECRET,
    trustHost: true,
    pages: {
        signIn: '/auth/signin',
        signOut: '/auth/signin',
        error: '/auth/signin',
    },
    callbacks: {
        authorized({ auth }) {
            return !!auth?.user;
        },
        async jwt({ token, user, account, trigger, session }) {
            // Sincronización inicial al iniciar sesión
            if (account && user) {
                console.log("[Auth] JWT Login:", account.provider, user.email);
                
                if (account.provider === "google" || account.provider === "google-cloud") {
                    try {
                        console.log("[Auth] Syncing Google to Backend:", {
                            email: user.email,
                            hasRT: !!account.refresh_token,
                            scope: account.scope
                        });

                        const response = await fetch(`${BACKEND_URL}/api/auth/google`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                email: user.email,
                                name: user.name,
                                sub: account.providerAccountId,
                                picture: user.image,
                                accessToken: account.access_token,
                                refreshToken: account.refresh_token,
                                expiresAt: account.expires_at,
                                scope: account.scope,
                            }),
                        });

                        console.log("[Auth] Backend Response:", response.status);

                        if (response.ok) {
                            const data = await response.json();
                            token.accessToken = data.access_token;
                            token.id = data.user.id;
                            token.image = data.user.avatar || user.image;
                            token.name = data.user.name || user.name;
                        } else {
                            const error = await response.text();
                            console.error("[Auth] Backend Sync Failed:", error);
                        }
                    } catch (error) {
                        console.error("[Auth] Error syncing google:", error);
                    }
                } else if (account.provider === "credentials") {
                    token.accessToken = (user as any).accessToken;
                    token.id = user.id;
                    token.image = (user as any).image;
                    token.name = user.name;
                }

                token.provider = account.provider;
            }

            // Manejar actualizaciones en caliente desde el cliente (session.update)
            if (trigger === "update" && session) {
                if (session.image) token.image = session.image;
                if (session.name) token.name = session.name;
            }

            return token;
        },
        async session({ session, token }) {
            if (session.user && token) {
                session.user.id = token.id as string;
                session.user.image = token.image as string;
                session.user.name = token.name as string;
                (session as any).accessToken = token.accessToken as string;
                (session as any).provider = token.provider as string;
            }
            return session
        },
    },
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true,
            authorization: {
              params: {
                prompt: "select_account",
                access_type: "offline",
                response_type: "code",
                scope: "openid email profile"
              }
            }
        }),
        Google({
            id: "google-cloud",
            name: "Google Cloud",
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true,
            authorization: {
              params: {
                prompt: "consent",
                access_type: "offline",
                response_type: "code",
                scope: "openid email profile https://www.googleapis.com/auth/cloud-platform"
              }
            }
        }),
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                try {
                    const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            email: credentials.email,
                            password: credentials.password,
                        }),
                    })

                    if (!response.ok) return null;

                    const data = await response.json();
                    
                    if (data.access_token && data.user) {
                        return {
                            id: data.user.id,
                            email: data.user.email,
                            name: data.user.name,
                            accessToken: data.access_token,
                        }
                    }
                    return null;
                } catch (error) {
                    console.error('[Auth] Login error:', error)
                    return null
                }
            },
        }),
    ],
} satisfies NextAuthConfig

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)