"use client";

import { useTheme } from "@/contexts/ToggleTheme";
import { Switch } from "@/components/ui/switch";
import { MoonIcon, SunIcon } from "lucide-react";
import clsx from "clsx";

export default function ThemeSwitcher() {
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="group inline-flex items-center gap-2">
            <SunIcon className={clsx("size-5 transition-colors duration-300", {
                "text-muted-foreground": theme === "dark",
            })} />
            <Switch
                checked={theme === "dark"}
                onCheckedChange={toggleTheme}
                className="h-5 data-[state=checked]:bg-primary cursor-pointer"
            />
            <MoonIcon className={clsx("size-5 transition-colors duration-300", {
                "text-muted-foreground": theme === "light",
            })} />
        </div>
    )
}