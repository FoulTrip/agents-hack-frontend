import { useSidebar } from "@/context/SidebarContext";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

function SidebarToggleButton() {
    const { isOpen, toggle } = useSidebar();

    return (
        <button
            onClick={toggle}
            className="
        p-2 rounded-lg
        text-[#8B8B85] dark:text-[#6B6B63]
        hover:bg-[#EFEFEC] dark:hover:bg-[#1E1E1C]
        hover:text-[#1A1A18] dark:hover:text-[#F0EFE9]
        transition-colors duration-150
      "
            aria-label={isOpen ? "Cerrar sidebar" : "Abrir sidebar"}
        >
            {isOpen
                ? <PanelLeftClose size={18} strokeWidth={1.8} />
                : <PanelLeftOpen size={18} strokeWidth={1.8} />
            }
        </button>
    );
}

export default SidebarToggleButton