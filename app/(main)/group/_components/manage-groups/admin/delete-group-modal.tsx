// React
import React from "react";

// Contexts
import { useGroup } from "@/contexts/GroupContext";

// UI Components
import { Button } from '../../../../../../components/ui/button';
import { CircleAlert } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

// Props
interface ExcluirGrupoModalProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function ExcluirGrupoModal({ open, onOpenChange }: ExcluirGrupoModalProps) {
    const [confirmText, setConfirmText] = React.useState('');

    const { selectedGroup } = useGroup();

    function handleExcluir() {
        onOpenChange?.(false);
        setConfirmText('');
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='gap-0 sm:max-w-[360px]'>
                <DialogHeader className='mb-2 gap-0'>
                    <DialogTitle className='flex items-center gap-1'>
                        <CircleAlert className='h-5 w-5 text-destructive' />
                        <span>Excluir grupo</span>
                    </DialogTitle>
                    <DialogDescription className='text-sm text-muted-foreground mt-1'>
                        Para confirmar, digite o nome do grupo.
                    </DialogDescription>
                </DialogHeader>

                <div className="mb-3">
                    <input
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        placeholder="Nome do grupo"
                        className="w-full rounded-md border p-2 text-sm focus:outline-none"
                    />
                </div>

                <DialogFooter className="gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className='hover:bg-secondary/20 hover:text-primary cursor-pointer'
                        onClick={() => onOpenChange?.(false)}
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="logout"
                        size="sm"
                        className='cursor-pointer'
                        onClick={handleExcluir}
                        disabled={confirmText !== selectedGroup?.name}
                    >
                        Excluir
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}