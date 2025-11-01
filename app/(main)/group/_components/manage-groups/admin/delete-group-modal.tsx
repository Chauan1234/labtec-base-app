// React
import React from "react";

// Contexts
import { useGroup } from "@/contexts/GroupContext";

// UI Components
import { Button } from '../../../../../../components/ui/button';
import { TriangleAlertIcon } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

// Props
interface ExcluirGrupoModalProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function ExcluirGrupoModal({ open, onOpenChange }: ExcluirGrupoModalProps) {
    const [confirmText, setConfirmText] = React.useState('');

    const { selectedGroup } = useGroup();

    React.useEffect(() => {
        if (!open) {
            setConfirmText('');
        }
    })

    function handleExcluir() {
        onOpenChange?.(false);
        setConfirmText('');
    }

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className='gap-2'>
                <AlertDialogHeader className='mb-2 gap-0'>
                    <div className='bg-destructive/10 mx-auto mb-2 flex size-12 items-center justify-center rounded-full'>
                        <TriangleAlertIcon className='text-destructive size-6' />
                    </div>
                    <AlertDialogTitle className="text-center">Tem certeza que deseja excluir este grupo?</AlertDialogTitle>
                    <AlertDialogDescription className='text-sm text-muted-foreground text-center mt-1'>
                        Esta ação não pode ser desfeita. Isso excluirá permanentemente o grupo e removerá o acesso de todos os seus membros.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="mb-3">
                    <p className="text-sm text-muted-foreground mb-1">
                        Para confirmar, digite <strong className="font-medium">{selectedGroup?.nameGroup}</strong> no campo abaixo.
                    </p>
                    <Input
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        placeholder="Nome do grupo"
                        className="w-full rounded-md border px-3 text-sm focus:outline-none"
                    />
                </div>

                <AlertDialogFooter className="gap-2">
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <Button
                        variant="destructive"
                        onClick={handleExcluir}
                        disabled={confirmText !== selectedGroup?.nameGroup}
                    >
                        Excluir
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}