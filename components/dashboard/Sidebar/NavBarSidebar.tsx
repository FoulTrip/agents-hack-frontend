import { usePathname, useRouter } from "next/navigation";
import { navItems } from "./data";
import { useSidebar } from "@/context/SidebarContext";
import { Plus, Trash2 } from "lucide-react";
import StatusDot from "../StatusDot";

interface NavBarSidebarProps {
    triggerDelete: (e: React.MouseEvent, sessionId: string, title: string) => void;
    deletingId: string | null;
}

function NavBarSidebar({ triggerDelete, deletingId }: NavBarSidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { setIsOpen, sessions } = useSidebar();

    return (
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5 scrollbar-thin scrollbar-thumb-[#D0D0CC] dark:scrollbar-thumb-[#3A3A36] scrollbar-track-transparent">

            {/* Main nav */}
            <section className="space-y-0.5">
                <p className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-[#B0B0A8] dark:text-[#4A4A44]">
                    Workspace
                </p>
                {navItems.map((item) => {
                    const active = pathname === item.path;
                    return (
                        <button
                            key={item.path}
                            onClick={() => { 
                                router.push(item.path); 
                                if (window.innerWidth < 1024) setIsOpen(false); 
                            }}
                            className={`
                  w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] font-medium
                  transition-colors duration-150
                  ${active
                                    ? "bg-white dark:bg-[#1E1E1C] text-[#1A1A18] dark:text-[#F0EFE9] shadow-sm border border-[#E8E8E4] dark:border-[#2A2A26]"
                                    : "text-[#5C5C56] dark:text-[#8B8B85] hover:bg-[#EFEFEC] dark:hover:bg-[#1E1E1C] hover:text-[#1A1A18] dark:hover:text-[#F0EFE9]"
                                }
                `}
                        >
                            <item.icon
                                size={15}
                                strokeWidth={active ? 2.2 : 1.8}
                                className={active ? "text-[#4F9CF9]" : ""}
                            />
                            {item.label}
                        </button>
                    );
                })}
            </section>

            {/* Recent sessions */}
            <section className="space-y-1.5">
                <div className="flex items-center justify-between px-2 pb-0.5">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-[#B0B0A8] dark:text-[#4A4A44]">
                        Recientes
                    </p>
                    <button
                        onClick={() => router.push("/factory")}
                        className="
                flex items-center gap-1 px-2 py-0.5 rounded-md
                text-[10px] font-semibold text-[#4F9CF9]
                hover:bg-[#4F9CF9]/10 dark:hover:bg-[#4F9CF9]/10
                transition-colors duration-150
              "
                    >
                        <Plus size={11} strokeWidth={2.5} />
                        Nuevo
                    </button>
                </div>

                <div className="space-y-0.5">
                    {sessions.map((p: any) => (
                        <div
                            key={p.sessionId}
                            onClick={() => { 
                                router.push(`/factory/${p.sessionId}`); 
                                if (window.innerWidth < 1024) setIsOpen(false); 
                            }}
                            className="
                  group flex items-center gap-2 px-2.5 py-2 rounded-md cursor-pointer
                  transition-colors duration-150
                  hover:bg-[#EFEFEC] dark:hover:bg-[#1E1E1C]
                "
                        >
                            <StatusDot status={p.status} />
                            <div className="flex-1 min-w-0">
                                <p className="text-[12px] font-medium text-[#3A3A36] dark:text-[#C8C7BF] truncate leading-tight group-hover:text-[#1A1A18] dark:group-hover:text-[#F0EFE9] transition-colors">
                                    {p.title}
                                </p>
                                <p className="text-[10px] text-[#B0B0A8] dark:text-[#4A4A44] mt-0.5">
                                    {new Date(p.createdAt).toLocaleDateString("es-CO", { day: "2-digit", month: "short" })}
                                </p>
                            </div>
                            <button
                                onClick={(e) => triggerDelete(e, p.sessionId, p.title)}
                                disabled={deletingId === p.sessionId}
                                className="
                    opacity-0 group-hover:opacity-100 p-1 rounded-md
                    text-[#B0B0A8] hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10
                    transition-all duration-150 shrink-0
                  "
                            >
                                <Trash2
                                    size={12}
                                    strokeWidth={1.8}
                                    className={deletingId === p.sessionId ? "animate-spin" : ""}
                                />
                            </button>
                        </div>
                    ))}

                    {sessions.length === 0 && (
                        <p className="px-2.5 py-3 text-[11px] text-[#B0B0A8] dark:text-[#4A4A44] italic">
                            Sin sesiones recientes
                        </p>
                    )}
                </div>
            </section>
        </nav>
    )
}

export default NavBarSidebar