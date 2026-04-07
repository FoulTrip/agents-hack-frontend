import { useDarkMode } from "@/context/DarkModeContext";
import Image from "next/image";

function LogoSidebar() {
    const { darkmode } = useDarkMode();

    return (
        <div className="flex items-center gap-3 px-5 py-5 border-b border-[#E8E8E4] dark:border-[#252522] shrink-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                {darkmode ? (
                    <Image src={"https://res.cloudinary.com/dqluumk10/image/upload/v1775217056/TripCode/Logos/image_f8hm5f.png"} alt="logo" width={500} height={500} />
                ) : (
                    <Image src={"https://res.cloudinary.com/dqluumk10/image/upload/v1768316985/TripCode/Logos/luc79qy6rewoqovhxwrz.png"} alt="logo" width={500} height={500} />
                )}
            </div>
            <div className="flex flex-col leading-none">
                <span className="text-[12px] font-semibold tracking-tight text-[#1A1A18] dark:text-[#F0EFE9]">
                    TripKode
                </span>
            </div>
        </div>
    )
}

export default LogoSidebar