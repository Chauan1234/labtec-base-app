"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

export default function useTheme() {
    const [theme, setTheme] = useState<Theme>("light");

    // Inicializa a partir do localStorage ou preferência do sistema
    useEffect(() => {
        if (typeof window === "undefined") return;

        const saved = localStorage.getItem("theme") as Theme | null;
        if (saved) {
            setTheme(saved);
            applyThemeClass(saved);
            return;
        }

        if (document.documentElement.classList.contains("dark")) {
            setTheme("dark");
            return;
        }

        const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
        const initial = prefersDark ? "dark" : "light";
        setTheme(initial);
        applyThemeClass(initial);
    }, []);

    // Persiste e aplica quando muda
    useEffect(() => {
        if (typeof window === "undefined") return;
        applyThemeClass(theme);
        localStorage.setItem("theme", theme);
    }, [theme]);

    const applyThemeClass = (t: Theme) => {
        if (t === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }

    const toggleTheme = () => setTheme(t => (t === "light" ? "dark" : "light"));

    return { theme, setTheme, toggleTheme };
}