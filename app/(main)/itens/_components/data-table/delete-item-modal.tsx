import React from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { CircleAlertIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useGroup } from "@/contexts/GroupContext";
import { deleteItem } from "@/lib/items-controller/items";
import { toast } from "sonner";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Spinner } from "@/components/ui/spinner";

// Props
interface ExcluirItemModalProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    idItem?: string | null;
    onDeleted?: (idItem: string) => void;
}

export default function DeleteItemModal({ open, onOpenChange, idItem, onDeleted }: ExcluirItemModalProps) {
    const { isAuthenticated, token } = useAuth();
    const { selectedGroup } = useGroup();
    const [deleting, setDeleting] = React.useState(false);

    // função para excluir o item
    async function handleExcluirItem() {
        // precaução extra: garantir autenticação e seleção de grupo
        if (!isAuthenticated) {
            console.warn("Tentativa de criar item sem estar autenticado");
            return;
        }
        if (!selectedGroup) {
            console.warn("Nenhum grupo selecionado ao tentar criar o item");
            return;
        }
        if (!idItem) {
            console.warn("Nenhum idItem fornecido para exclusão");
            return;
        }

        try {
            setDeleting(true);
            // chamada para excluir o item
            await deleteItem(selectedGroup.idGroup, idItem, token);
            toast.success("Item excluído com sucesso.", { closeButton: true });
            onOpenChange?.(false);
            onDeleted?.(idItem);
        } catch (e) {
            console.error("Erro ao excluir item:", e);
            toast.error("Erro ao excluir o item.", { closeButton: true });
        } finally {
            setDeleting(false);
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="gap-2">
                <AlertDialogHeader className="mb-2 gap-0">
                    <div className="bg-destructive/10 mx-auto mb-2 flex size-12 items-center justify-center rounded-full">
                        <CircleAlertIcon className="text-destructive size-6" />
                    </div>
                    <AlertDialogTitle className="text-center">Tem certeza que deseja excluir este item?</AlertDialogTitle>
                    <AlertDialogDescription className="text-sm text-muted-foreground text-center mt-1">
                        Esta ação não pode ser desfeita. Isso excluirá permanentemente o item.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                
                <AlertDialogFooter className="gap-2">
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <Button
                        variant="destructive"
                        onClick={handleExcluirItem}
                        disabled={deleting}
                    >
                        {deleting ? (
                            <>
                                <Spinner className="size-5 text-white" />
                                <span>Excluindo...</span>
                            </>
                        ) : 'Excluir'}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        // <Dialog open={open} onOpenChange={onOpenChange}>
        //     <DialogContent className="gap-0 sm:max-w-[360px]">
        //         <DialogHeader className="mb-2 gap-0">
        //             <DialogTitle className="flex items-center gap-1">
        //                 <CircleAlertIcon className="size-5 text-destructive" />
        //                 <span>Excluir item</span>
        //             </DialogTitle>
        //             <DialogDescription className="text-sm text-muted-foreground mt-1">
        //                 <span>Tem certeza que deseja excluir este item?</span>
        //             </DialogDescription>
        //         </DialogHeader>
        //         <DialogFooter className="gap-2">
        //             <Button
        //                 variant="outline"
        //                 size="sm"
        //                 className="cursor-pointer"
        //                 onClick={() => onOpenChange?.(false)}
        //             >
        //                 Cancelar
        //             </Button>
        //             <Button
        //                 variant="logout"
        //                 size="sm"
        //                 className="cursor-pointer"
        //                 onClick={handleExcluirItem}
        //                 disabled={deleting}
        //             >
        //                 {deleting ? 'Excluindo...' : 'Excluir'}
        //             </Button>
        //         </DialogFooter>
        //     </DialogContent>
        // </Dialog>
    );
}