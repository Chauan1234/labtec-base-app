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
            <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
                <div className="flex flex-col md:flex-row">
                    <div className="flex items-center justify-center p-6 bg-card md:w-20">
                        <div className="rounded-full bg-background p-2 shadow-md">
                            <CircleAlertIcon className="size-7 text-destructive" />
                        </div>
                    </div>

                    <div className="p-6 flex-1">
                        <DialogHeader className="p-0 mb-1">
                            <DialogTitle className="text-lg font-semibold">Sair do Grupo</DialogTitle>
                        </DialogHeader>
                        <div className="text-sm text-muted-foreground mb-4">
                            <DialogDescription>
                                Tem certeza que deseja sair do grupo? Você pode entrar novamente se tiver o link de convite.
                            </DialogDescription>
                        </div>

                        <div className="flex justify-end gap-2">
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
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
        // <Dialog open={open} onOpenChange={onOpenChange}>
        //     <DialogContent className='gap-0 sm:max-w-[360px]'>
        //         <DialogHeader className='mb-3 gap-0'>
        //             <DialogTitle className='flex items-center gap-1'>
        //                 <CircleAlertIcon className='h-5 w-5 text-destructive' />
        //                 <span>Sair do grupo</span>
        //             </DialogTitle>
        //             <DialogDescription className='text-sm text-muted-foreground mt-1'>
        //                 Tem certeza que deseja sair do grupo? Você pode entrar novamente se tiver o link de convite.
        //             </DialogDescription>
        //         </DialogHeader>
        //         <DialogFooter className="gap-2 sm:justify-center">
        //             <Button
        //                 variant="outline"
        //                 size="sm"
        //                 className='hover:bg-secondary/20 hover:text-primary cursor-pointer'
        //                 onClick={() => onOpenChange?.(false)}
        //             >
        //                 Cancelar
        //             </Button>
        //             <Button
        //                 variant="logout"
        //                 size="sm"
        //                 className='sm:min-w-[80px] cursor-pointer'
        //                 onClick={() => {
        //                     // Lógica para sair do grupo
        //                 }}
        //             >
        //                 Sair
        //             </Button>
        //         </DialogFooter>
        //     </DialogContent>
        // </Dialog>
    );
}