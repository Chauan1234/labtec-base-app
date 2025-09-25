import { title } from "process";
import LogoLabtec from "../public/logo-labtec.png";
import { NavMain } from "./nav-main";
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuButton } from "./ui/sidebar";
import { LayoutDashboard, PlusCircle, TableOfContents } from "lucide-react";
import { Button } from "./ui/button";

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
    ]
};

export default function AppSidebar() {
    return (
        <Sidebar variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuButton asChild>
                        <a href="#" className="h-auto w-auto">
                            <img src={LogoLabtec.src} alt="Logo Labtec" width={90} />
                        </a>
                    </SidebarMenuButton>
                </SidebarMenu>
                <SidebarMenu>
                    <Button className="w-full cursor-pointer" size="sm">
                        <PlusCircle className="h-4 w-4" />
                        Convidar
                    </Button>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={data.NavMain} />
            </SidebarContent>
        </Sidebar>
    )
}