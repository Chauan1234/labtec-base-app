"use client";

import useTheme from "@/hooks/data-theme";
import { Switch } from "@/components/ui/switch";

export default function ThemeSwitcher() {
    const { theme, toggleTheme } = useTheme();

    return (
        <Switch 
            checked={theme === "dark"}
            onCheckedChange={toggleTheme}
            className="data-[state=checked]:bg-primary cursor-pointer"
        />
    )
}