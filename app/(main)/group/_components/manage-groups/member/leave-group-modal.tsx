// React
import React from "react";

// UI Components
import { Button } from '../../../../../../components/ui/button';
import { CircleAlertIcon } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '../../../../../../components/ui/dialog';

// Props
interface SairGrupoModalProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function SairGrupoModal({ open, onOpenChange }: SairGrupoModalProps) {
    const [logout, setLogout] = React.useState('');

    function handleSair() {
        // Lógica para sair do grupo
        onOpenChange?.(false);
        setLogout('');
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='gap-0 sm:max-w-[360px]'>
                <DialogHeader className='mb-3 gap-0'>
                    <DialogTitle className='flex items-center gap-1'>
                        <CircleAlertIcon className='h-5 w-5 text-destructive' />
                        <span>Sair do grupo</span>
                    </DialogTitle>
                    <DialogDescription className='text-sm text-muted-foreground mt-1'>
                        Tem certeza que deseja sair do grupo? Você pode entrar novamente se tiver o link de convite.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:justify-center">
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
                        className='sm:min-w-[80px] cursor-pointer'
                        onClick={() => {
                            // Lógica para sair do grupo
                        }}
                    >
                        Sair
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}