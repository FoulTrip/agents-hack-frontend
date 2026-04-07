"use client";

import React, {
    createContext,
    useContext,
    ReactNode,
    useState,
    useEffect
} from "react";

interface DarkModeContextType {
    darkmode: boolean;
    changeDarkMode: () => void;
}

const DarkModeContext = createContext<DarkModeContextType | undefined>(undefined);

export function DarkModeProvider({ children }: { children: ReactNode }) {
    const [mounted, setMounted] = useState(false);
    const [darkmode, setDarkmode] = useState(false);

    // Initialize theme on mount
    useEffect(() => {
        setMounted(true);

        // Check localStorage first, then system preference
        const savedTheme = localStorage.getItem("theme");
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

        const initialDarkMode = savedTheme === "dark" || (savedTheme === null && prefersDark);

        setDarkmode(initialDarkMode);

        // Apply theme to document
        if (initialDarkMode) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, []);

    // Listen to system theme changes
    useEffect(() => {
        if (!mounted) return;

        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

        const handleChange = (e: MediaQueryListEvent) => {
            // Only auto-change if user hasn't set a preference
            if (!localStorage.getItem("theme")) {
                const newDarkMode = e.matches;
                setDarkmode(newDarkMode);

                if (newDarkMode) {
                    document.documentElement.classList.add("dark");
                } else {
                    document.documentElement.classList.remove("dark");
                }
            }
        };

        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, [mounted]);

    // Function to toggle dark mode
    const changeDarkMode = () => {
        setDarkmode(prevDarkMode => {
            const newDarkMode = !prevDarkMode;

            // Apply to DOM
            if (newDarkMode) {
                document.documentElement.classList.add("dark");
                localStorage.setItem("theme", "dark");
            } else {
                document.documentElement.classList.remove("dark");
                localStorage.setItem("theme", "light");
            }

            return newDarkMode;
        });
    };

    return (
        <DarkModeContext.Provider value={{ darkmode, changeDarkMode }}>
            {children}
        </DarkModeContext.Provider>
    );
}

export function useDarkMode() {
    const context = useContext(DarkModeContext);
    if (context === undefined) {
        throw new Error("useDarkMode must be used within a DarkModeProvider");
    }
    return context;
}