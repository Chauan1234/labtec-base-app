// Next
import Link from "next/link";
import { usePathname } from "next/navigation";

// UI
import { LucideIcon } from "lucide-react";
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "../../../../components/ui/sidebar";

export function NavMain({
    items,
}: {
    items: {
        title: string
        url: string
        icon: LucideIcon
    }[]
}) {
    const pathname = usePathname();
    return (
        <SidebarGroup>
            <SidebarGroupLabel>
                Dashboard
            </SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild tooltip={item.title} className="hover:text-primary hover:bg-transparent">
                            <Link
                                href={item.url}
                                className={`transition-all duration-300 
                                ${pathname === item.url ? "bg-secondary/20 text-primary hover:!bg-secondary/20 cursor-default" : "hover:gap-3"}
                                    `}
                            >
                                <item.icon />
                                <span>{item.title}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    )
}