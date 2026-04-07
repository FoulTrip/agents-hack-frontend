"use client";

import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";

export function useSidebarLogout() {
    const { data: session } = useSession();

    const handleLogout = async () => {
        try {
            const token = (session as any)?.accessToken;
            if (token) {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
                await fetch(`${apiUrl}/api/auth/logout`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                });
            }
        } catch (e) {
            console.error("Error logging out from backend", e);
        } finally {
            signOut({ callbackUrl: "/" });
        }
    };

    return { handleLogout };
}
