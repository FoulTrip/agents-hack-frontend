"use client"

import { useSidebar } from "@/context/SidebarContext";
import { useSessionDelete } from "@/hooks/useSessionDelete";
import LogoSidebar from "./Logo";
import NavBarSidebar from "./NavBarSidebar";
import FooterSidebar from "./FooterSidebar";
import DeleteModal from "../modal/SeleteChatModal";

function SidebarContent() {
    const { isOpen, setIsOpen } = useSidebar();

    const {
        isDeleteModalOpen,
        sessionToDelete,
        executeDelete,
        setIsDeleteModalOpen,
        deletingId,
        triggerDelete,
    } = useSessionDelete();

    return (
        <>
            <div
                className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
                onClick={() => setIsOpen(false)}
            />
            <aside
                className={`fixed lg:relative z-50 h-screen flex flex-col shrink-0 bg-[#F7F7F5] dark:bg-[#141413] border-[#E8E8E4] dark:border-[#252522] transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? "w-64 translate-x-0 border-r" : "w-64 -translate-x-full lg:w-0 lg:translate-x-0 lg:border-r-0 lg:opacity-0"}`}
            >
                <div className="flex flex-col h-full w-64 overflow-hidden">
                    <div className="flex flex-col h-full min-w-[16rem]">
                        <LogoSidebar />
                        <NavBarSidebar triggerDelete={triggerDelete} deletingId={deletingId} />
                        <FooterSidebar />
                    </div>
                </div>
            </aside>

            {/* Modal rendered at root level — fullscreen blur overlay */}
            <DeleteModal
                isOpen={isDeleteModalOpen}
                title={sessionToDelete?.title || ""}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={executeDelete}
            />
        </>
    );
}

export default SidebarContent