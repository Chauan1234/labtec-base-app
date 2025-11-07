import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { TriangleAlertIcon } from "lucide-react";

interface LogoutModalProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export default function LogoutModal({ open, onOpenChange }: LogoutModalProps) {
    const { logout } = useAuth();
    
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="gap-2">
                <AlertDialogHeader className="mb-2 gap-0">
                    <div className='bg-destructive/10 mx-auto mb-2 flex size-12 items-center justify-center rounded-full'>
                        <TriangleAlertIcon className='text-destructive size-6' />
                    </div>
                    <AlertDialogTitle className="text-center">Tem certeza que deseja sair?</AlertDialogTitle>
                    <AlertDialogDescription className="text-sm text-muted-foreground text-center mt-1">
                        Você precisará fazer login novamente para acessar sua conta.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                
                <AlertDialogFooter className="gap-2 flex flex-col sm:flex-col">
                    <Button
                        variant="logout"
                        onClick={logout}
                        className="w-full"
                    >
                        Sair
                    </Button>
                    <AlertDialogCancel className="w-full">Cancelar</AlertDialogCancel>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}