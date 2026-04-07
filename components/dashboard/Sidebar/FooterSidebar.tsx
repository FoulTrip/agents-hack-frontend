import { useSidebar } from "@/context/SidebarContext";
import { useSidebarLogout } from "@/hooks/useSidebarLogout";
import { LogOut, Settings } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";


function FooterSidebar() {
    const router = useRouter();
    const { data: session } = useSession();
    const { isOpen, setIsOpen } = useSidebar();
    const { handleLogout } = useSidebarLogout();

    return (
        <div className="shrink-0 border-t border-[#E8E8E4] dark:border-[#252522] p-3 space-y-1">
            {/* User row */}
            <button
                onClick={() => { 
                    router.push("/preferences"); 
                    if (window.innerWidth < 1024) setIsOpen(false); 
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md hover:bg-[#EFEFEC] dark:hover:bg-[#1E1E1C] transition-colors duration-150 group"
            >
                <div className="w-7 h-7 rounded-full bg-[#E8E8E4] dark:bg-[#2A2A26] flex items-center justify-center text-[11px] font-semibold text-[#5C5C56] dark:text-[#8B8B85] overflow-hidden shrink-0">
                    {session?.user?.image ? (
                        <img src={session.user.image} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                        session?.user?.name?.charAt(0) || "U"
                    )}
                </div>
                <div className="flex-1 text-left min-w-0">
                    <p className="text-[12px] font-medium text-[#1A1A18] dark:text-[#F0EFE9] truncate leading-tight">
                        {session?.user?.name || "Usuario"}
                    </p>
                    <p className="text-[10px] text-[#B0B0A8] dark:text-[#4A4A44]">Preferencias</p>
                </div>
                <Settings size={13} strokeWidth={1.8} className="text-[#B0B0A8] dark:text-[#4A4A44] shrink-0" />
            </button>

            {/* Logout */}
            <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-[12px] font-medium text-[#8B8B85] dark:text-[#6B6B63] hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 transition-colors duration-150"
            >
                <LogOut size={13} strokeWidth={1.8} />
                Cerrar sesión
            </button>
        </div>
    )
}

export default FooterSidebar