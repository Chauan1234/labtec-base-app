"use client";

// ...existing code...
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import useTheme from "@/hooks/data-theme";

export default function ThemeSwitcher() {
    const { theme, toggleTheme } = useTheme();

    return (
        <Button
            variant="outline"
            size="icon"
            className='mr-4 h-8 cursor-pointer hover:bg-secondary/20 hover:text-primary'
            onClick={toggleTheme}
            aria-label="Alternar tema"
        >
            {theme === "light" ? <Moon /> : <Sun />}
        </Button>
    )
}