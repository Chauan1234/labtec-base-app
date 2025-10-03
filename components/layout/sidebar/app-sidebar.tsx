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
            url: "/dashboard",
            icon: LayoutDashboard,
        },
        {
            title: "Itens",
            url: "/itens",
            icon: TableOfContents,
        }
    ],
};

export default function AppSidebar() {
    const { selectedGroup, setSelectedGroup, groups, loading } = useGroup();

    // estado para controlar o modal de renomear
    const [showRenomear, setShowRenomear] = React.useState(false);

    // estado para controlar o modal de excluir
    const [showExcluir, setShowExcluir] = React.useState(false);

    // estado para controlar o modal de sair
    const [showSair, setShowSair] = React.useState(false);

    // seta o grupo inicial baseado nos groups carregados
    useEffect(() => {
        if (!selectedGroup && groups && groups.length > 0) setSelectedGroup(groups[0]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

            {/* Modal de renomear grupo - controlado pelo estado */}
            <RenomearGrupoModal open={showRenomear} onOpenChange={setShowRenomear} />

            {/* Modal de excluir grupo - controlado pelo estado */}
            <ExcluirGrupoModal open={showExcluir} onOpenChange={setShowExcluir} />

            {/* Modal de sair do grupo - controlado pelo estado */}
            <SairGrupoModal open={showSair} onOpenChange={setShowSair} />
        </Sidebar>
    )
}