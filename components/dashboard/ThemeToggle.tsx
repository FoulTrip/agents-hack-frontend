import { useDarkMode } from "@/context/DarkModeContext";
import { Moon, Sun } from "lucide-react";

function ThemeToggle() {
  const { darkmode, changeDarkMode } = useDarkMode();

  return (
    <button
      onClick={changeDarkMode}
      className="p-2 rounded-lg text-[#5C5C56] dark:text-[#8B8B85] hover:bg-[#EFEFEC] dark:hover:bg-[#1E1E1C] transition-colors"
      title={darkmode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {darkmode ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}

export default ThemeToggle