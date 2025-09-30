// React
import React from 'react';

// UI Components
import { Button } from '../../../../ui/button';
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
interface RenomearGrupoModalProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function RenomearGrupoModal({ open, onOpenChange }: RenomearGrupoModalProps) {
    const [novoNome, setNovoNome] = React.useState('');

    function handleSalvar() {
        onOpenChange?.(false);
        setNovoNome('');
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='gap-0 sm:max-w-[360px]'>
                <DialogHeader className='mb-2 gap-0'>
                    <DialogTitle className='flex items-center gap-2'>
                        <CircleAlert className='h-5 w-5 text-primary' />
                        <span>Renomear grupo</span>
                    </DialogTitle>
                    <DialogDescription className='text-sm text-muted-foreground mt-1'>
                        Informe o novo nome do grupo.
                    </DialogDescription>
                </DialogHeader>

                <div className="mb-3">
                    <input
                        value={novoNome}
                        onChange={(e) => setNovoNome(e.target.value)}
                        placeholder="Novo nome do grupo"
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
                        variant="default"
                        size="sm"
                        className='hover:opacity-90 cursor-pointer'
                        onClick={handleSalvar}
                        disabled={!novoNome.trim()}
                    >
                        Salvar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}