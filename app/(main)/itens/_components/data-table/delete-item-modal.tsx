import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CircleAlert } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useGroup } from "@/contexts/GroupContext";
import { deleteItem } from "@/lib/items-controller/items";
import { toast } from "sonner";

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
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="gap-0 sm:max-w-[360px]">
                <DialogHeader className="mb-2 gap-0">
                    <DialogTitle className="flex items-center gap-1">
                        <CircleAlert className="size-5 text-destructive" />
                        <span>Excluir item</span>
                    </DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground mt-1">
                        <span>Tem certeza que deseja excluir este item?</span>
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="cursor-pointer"
                        onClick={() => onOpenChange?.(false)}
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="logout"
                        size="sm"
                        className="cursor-pointer"
                        onClick={handleExcluirItem}
                        disabled={deleting}
                    >
                        {deleting ? 'Excluindo...' : 'Excluir'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}