"use client";

import { useState } from "react";
import { useSidebar } from "@/context/SidebarContext";
import { archiveNotionPage, deleteGitHubRepo } from "@/app/lib/cleanupUtils";
import { apiClient } from "@/app/lib/softwareFactoryClient";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";

export function useSessionDelete() {
    const { sessions, setSessions } = useSidebar();
    const { data: session } = useSession();
    const pathname = usePathname();
    const router = useRouter();
    const accessToken = (session as any)?.accessToken;

    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [sessionToDelete, setSessionToDelete] = useState<{ id: string; title } | null>(null);

    const triggerDelete = (e: React.MouseEvent, sessionId: string, title: string) => {
        e.stopPropagation();
        setSessionToDelete({ id: sessionId, title });
        setIsDeleteModalOpen(true);
    };

    const executeDelete = async () => {
        if (!sessionToDelete || !accessToken) return;
        const sessionId = sessionToDelete.id;
        setIsDeleteModalOpen(false);
        setDeletingId(sessionId);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const sessionDetails = await apiClient.getStatus(sessionId, accessToken);
            const configResp = await fetch(`${apiUrl}/api/user/config`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            const userConfig = configResp.ok ? await configResp.json() : null;
            if (userConfig && sessionDetails?.result) {
                const repoUrl = sessionDetails.result.repoUrl;
                if (repoUrl && userConfig.githubToken)
                    await deleteGitHubRepo(userConfig.githubToken, repoUrl);
                const notionDocs = sessionDetails.result.notionDocs || sessionDetails.result.docs || [];
                if (notionDocs.length > 0 && userConfig.notionToken)
                    for (const doc of notionDocs)
                        if (doc.url) await archiveNotionPage(userConfig.notionToken, doc.url);
            }
            await fetch(`${apiUrl}/api/sessions/${sessionId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            setSessions(sessions.filter((p: any) => p.sessionId !== sessionId));
            if (pathname.includes(sessionId)) router.push("/dashboard");
        } catch (e) {
            console.error("Error eliminando sesión y recursos", e);
            alert("Error eliminando algunos recursos, pero la sesión ha sido marcada para borrado.");
        } finally {
            setDeletingId(null);
            setSessionToDelete(null);
        }
    };

    return {
        deletingId,
        isDeleteModalOpen,
        sessionToDelete,
        triggerDelete,
        executeDelete,
        setIsDeleteModalOpen,
    };
}
