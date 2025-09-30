"use client";

// React
import React from "react";
import { useEffect } from "react";

// Components
import { NavMain } from "@/components/layout/sidebar/nav-main";
import { NavHeader } from "@/components/layout/sidebar/nav-header";
import { SairGrupoModal } from "@/components/layout/sidebar/manage-groups/member/leave-group-modal";
import { ExcluirGrupoModal } from "@/components/layout/sidebar/manage-groups/admin/delete-group-modal";
import { RenomearGrupoModal } from "@/components/layout/sidebar/manage-groups/admin/rename-group-modal";

// Contexts e Libs
import { useSidebar } from "@/components/ui/sidebar";
import { useGroup, Group } from "@/contexts/GroupContext";

// UI Components
import { LayoutDashboard, TableOfContents } from "lucide-react";
import { Sidebar, SidebarContent, SidebarHeader} from "../../ui/sidebar";

// Dados estáticos para popular o sidebar
const data = {
    NavMain: [
        {
            title: "Home",
            url: "/dev/apps/dashboard",
            icon: LayoutDashboard,
        },
        {
            title: "Itens",
            url: "/dev/apps/itens",
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
    const { selectedGroup, setSelectedGroup } = useGroup();

    // estado para controlar o modal de renomear
    const [showRenomear, setShowRenomear] = React.useState(false);

    // estado para controlar o modal de excluir
    const [showExcluir, setShowExcluir] = React.useState(false);

    // estado para controlar o modal de sair
    const [showSair, setShowSair] = React.useState(false);

    // seta o grupo inicial baseado no defaultValue do select
    useEffect(() => {
        if (!selectedGroup) {
            const g = data.groups[0] as Group;
            setSelectedGroup(g);
        }
    }, []);

    return (
        <Sidebar variant="inset" collapsible="icon">
            {/* Header */}
            <SidebarHeader>
                <NavHeader groups={data.groups} />
            </SidebarHeader>
            
            {/* Content */}
            <SidebarContent>
                <NavMain items={data.NavMain} />
            </SidebarContent>

            {/* Modal de renomear grupo - controlado pelo estado */}
            <RenomearGrupoModal open={showRenomear} onOpenChange={setShowRenomear} />

            {/* Modal de excluir grupo - controlado pelo estado */}
            <ExcluirGrupoModal open={showExcluir} onOpenChange={setShowExcluir} />

            {/* Modal de sair do grupo - controlado pelo estado */}
            <SairGrupoModal open={showSair} onOpenChange={setShowSair} />
        </Sidebar>
    )
}