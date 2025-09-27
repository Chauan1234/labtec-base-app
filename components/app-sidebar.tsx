"use client";

import { useEffect } from "react";
import { title } from "process";
import LogoLabtec from "../public/logo-labtec.png";
import { NavMain } from "./nav-main";
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuButton } from "./ui/sidebar";
import { Ellipsis, LayoutDashboard, Pencil, PlusCircle, TableOfContents, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "./ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { useGroup, Group } from "@/contexts/GroupContext";

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
            id: 1,
            name: "Edumind",
            role: "Admin",
        },
        {
            id: 2,
            name: "Eletric Games",
            role: "Member",
        },
        {
            id: 3,
            name: "Labtec One",
            role: "Member",
        },
        {
            id: 4,
            name: "BaseApp",
            role: "Admin",
        },
    ]
};

export default function AppSidebar() {
    const { selectedGroup, setSelectedGroup } = useGroup();

    // seta o grupo inicial baseado no defaultValue do select
    useEffect(() => {
        if (!selectedGroup) {
            const g = data.groups[0] as Group;
            setSelectedGroup(g);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Sidebar variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuButton asChild className="transition-all duration-200">
                        <a href="#" className="h-auto w-auto">
                            <img src={LogoLabtec.src} alt="Logo Labtec" width={90} />
                        </a>
                    </SidebarMenuButton>
                </SidebarMenu>
                <SidebarMenu>
                    <Select defaultValue={data.groups[0].name} onValueChange={(val) => {
                        const g = data.groups.find((gr) => gr.name === val) ?? null;
                        setSelectedGroup(g as Group | null);
                    }}>
                        <SelectTrigger className="w-[180px] bg-muted cursor-pointer" size="sm">
                            <SelectValue placeholder="Selecione um Grupo" />
                        </SelectTrigger>
                        <SelectContent position="popper">
                            <Button className="w-full rounded-md h-7 mb-1 text-xs cursor-pointer" variant="outline">
                                Novo Grupo
                            </Button>
                            <SelectGroup>
                                <SelectLabel>Grupos</SelectLabel>
                                {data.groups.map((group) => (
                                    <SelectItem
                                        key={group.id}
                                        value={group.name}
                                        className='focus:bg-muted/80 cursor-pointer'
                                    >
                                        {group.name}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={data.NavMain} />
            </SidebarContent>
        </Sidebar>
    )
}