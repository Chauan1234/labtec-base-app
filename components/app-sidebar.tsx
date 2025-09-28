"use client";

// React
import React from "react";
import { useEffect } from "react";

// Assets
import LogoLabtec from "../public/logo-labtec.png";
import LogoLabtecSemTexto from "../public/logo-labtec-sem-texto.png";

// Components
import { NavMain } from "./nav-main";

// Contexts e Hooks
import { cn } from "@/lib/utils";
import { useGroup, Group } from "@/contexts/GroupContext";
import { useSidebar } from "@/components/ui/sidebar";

// UI
import { Button } from "./ui/button";
import { CheckIcon, ChevronsUpDown, LayoutDashboard, TableOfContents } from "lucide-react";
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuButton } from "./ui/sidebar";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "./ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "./ui/command";

const data = {
    NavMain: [
        {
            title: "Home",
            url: "/dashboard",
            icon: LayoutDashboard,
        },
        {
            title: "Itens",
            url: "/itens",
            icon: TableOfContents,
        }
    ],
    groups: [
        {
            value: "edumind",
            name: "Edumind",
            role: "Admin",
        },
        {
            value: "eletric-games",
            name: "Eletric Games",
            role: "Member",
        },
        {
            value: "labtec-one",
            name: "Labtec One",
            role: "Member",
        },
        {
            value: "base-app",
            name: "BaseApp",
            role: "Admin",
        },
    ]
};

export default function AppSidebar() {
    const [open, setOpen] = React.useState(false)
    const [value, setValue] = React.useState("")
    const { selectedGroup, setSelectedGroup } = useGroup();

    // seta o grupo inicial baseado no defaultValue do select
    useEffect(() => {
        if (!selectedGroup) {
            const g = data.groups[0] as Group;
            setSelectedGroup(g);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const { state } = useSidebar();

    return (
        <Sidebar variant="inset" collapsible="icon">
            <SidebarHeader>

                {/* Logo */}
                <SidebarMenu>
                    <SidebarMenuButton asChild className="transition-all duration-200">
                        <a href="#" className="h-auto w-auto">
                            {state === "collapsed" ? (
                                <img src={LogoLabtecSemTexto.src} alt="Logo Labtec" width={40} />
                            ) : (
                                <img src={LogoLabtec.src} alt="Logo Labtec" width={90} />
                            )}
                        </a>
                    </SidebarMenuButton>
                </SidebarMenu>

                {/* Select Group */}
                <SidebarMenu>
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger
                            asChild
                            className="w-auto"
                            tooltip={cn(selectedGroup ? selectedGroup.name : "Selecionar grupo")}
                        >
                            <Button
                                variant="outline"
                                size="sm"
                                role="combobox"
                                aria-expanded={open}
                                className={cn("p-0 text-sm font-medium bg-muted justify-between cursor-pointer hover:bg-muted/50",
                                    state === "collapsed" && "w-8 h-8 flex items-center justify-center rounded-md"
                                )}
                                aria-label="Selecionar grupo"
                            >
                                {state === "collapsed" ? (
                                    <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                                ) : (
                                    <>
                                        {value ? value : (selectedGroup ? selectedGroup.name : <span>Selecionar Grupo</span>)}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[210px] p-0" align="start">
                            <Command>
                                <CommandInput
                                    placeholder="Procurar grupo..."
                                />
                                <CommandList>
                                    <CommandEmpty>Nenhum grupo encontrado</CommandEmpty>
                                    <CommandGroup>
                                        <CommandItem className="!bg-transparent p-0 pt-1">
                                            <Button className="w-full rounded-md h-7 mb-1 text-xs cursor-pointer hover:bg-secondary/10 hover:text-secondary" variant="outline">
                                                <span>Novo Grupo</span>
                                            </Button>
                                        </CommandItem>
                                    </CommandGroup>
                                    <CommandSeparator className="my-1" />
                                    <CommandGroup>
                                        {data.groups.map((group) => (
                                            <CommandItem
                                                key={group.value}
                                                onSelect={() => {
                                                    setSelectedGroup(group);
                                                    setOpen(false);
                                                }}
                                                className="justify-between cursor-pointer hover:!bg-secondary/10 hover:!text-secondary focus:!bg-secondary/10 focus:!text-secondary"
                                            >
                                                {group.name}
                                                <CheckIcon
                                                    className={cn(
                                                        "mr-2 h-4 w-4 hover:text-secondary",
                                                        group.value === selectedGroup?.value ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={data.NavMain} />
            </SidebarContent>
        </Sidebar>
    )
}