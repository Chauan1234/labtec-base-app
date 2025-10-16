import { SidebarProvider } from "@/components/ui/sidebar";
import { AuthProvider } from "@/contexts/AuthContext";
import { GroupProvider } from "@/contexts/GroupContext";
import { ThemeProvider } from "@/contexts/ToggleTheme";

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            {
                <SidebarProvider>
                    <GroupProvider>
                        <ThemeProvider>
                            {children}
                        </ThemeProvider>
                    </GroupProvider>
                </SidebarProvider>
            }
        </AuthProvider>
    )
}