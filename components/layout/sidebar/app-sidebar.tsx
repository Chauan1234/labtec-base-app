"use client";

// React
import React from "react";
import { useEffect } from "react";

// Components
import { NavMain } from "@/components/layout/sidebar/nav-main";
import { NavHeader } from "@/components/layout/sidebar/nav-header";

// Contexts e Libs
import { useGroup } from "@/contexts/GroupContext";

// UI Components
import { LayoutDashboardIcon, TableOfContentsIcon } from "lucide-react";
import { Sidebar, SidebarContent, SidebarHeader} from "../../ui/sidebar";

// Dados estáticos para popular o sidebar
const data = {
    NavMain: [
        {
            title: "Home",
            url: "/dashboard",
            icon: LayoutDashboardIcon,
        },
        {
            title: "Itens",
            url: "/itens",
            icon: TableOfContentsIcon,
        }
    ],
};

export default function AppSidebar() {
    const { selectedGroup, setSelectedGroup, groups } = useGroup();

    // seta o grupo inicial baseado nos groups carregados
    useEffect(() => {
        if (!selectedGroup && groups && groups.length > 0) setSelectedGroup(groups[0]);
    }, [groups]);

    return (
        <Sidebar variant="inset" collapsible="icon">
            {/* Header */}
            <SidebarHeader>
                <NavHeader groups={groups || []} />
            </SidebarHeader>
            
            {/* Content */}
            <SidebarContent>
                <NavMain items={data.NavMain} />
            </SidebarContent>
        </Sidebar>
    )
}