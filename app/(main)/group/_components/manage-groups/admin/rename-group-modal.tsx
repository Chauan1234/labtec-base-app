// React
import React from 'react';

// UI Components
import { Button } from '../../../../../../components/ui/button';
import { EditIcon } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/AuthContext';
import { useGroup } from '@/contexts/GroupContext';
import { renameGroup } from '@/lib/group-controller/group';
import { toast } from 'sonner';
import { Spinner } from '@/components/ui/spinner';

// Props
interface RenomearGrupoModalProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

const baseSchema = z.object({
    nomeGrupo: z.string().min(3, "O nome deve ter no mínimo 3 caracteres").max(50, "O nome' deve ter no máximo 50 caracteres").nonempty("O nome do grupo é obrigatório"),
});

export default function RenomearGrupoModal({ open, onOpenChange }: RenomearGrupoModalProps) {
    type FormValues = z.infer<typeof baseSchema>;

    const form = useForm<FormValues>({
        mode: 'onChange',
        reValidateMode: 'onChange',
        resolver: zodResolver(baseSchema),
        defaultValues: {
            nomeGrupo: '',
        }
    })

    // Definindo variáveis de Contexts
    const { firstName, lastName, isAuthenticated, token } = useAuth();
    const { selectedGroup, refresh } = useGroup();

    // Estado de botão de envio do formulário
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    React.useEffect(() => {
        // Quando o modal abrir, preencher o form com o nome atual do grupo
        if (selectedGroup?.ownerGroup !== `${firstName} ${lastName}`) {
            console.warn("O usuário atual não é o dono do grupo selecionado.");
            onOpenChange?.(false);
            return;
        }
        if (open) {
            form.reset({
                nomeGrupo: selectedGroup?.nameGroup ?? '',
            })
        } else {
            form.clearErrors();
        }
    }, [open, selectedGroup, form, onOpenChange, firstName, lastName]);

    async function alterarNomeGrupo(data: FormValues) {
        if (open) {
            if (!isAuthenticated) {
                console.warn("Tentativa de renomear grupo sem estar autenticado");
                return;
            }
            if (!selectedGroup) {
                console.warn("Nenhum grupo selecionado ao tentar renomear");
                return;
            }
            if (data.nomeGrupo === selectedGroup.nameGroup) {
                toast.error("O novo nome do grupo deve ser diferente do atual.", { closeButton: true });
                return;
            }

            setIsSubmitting(true);
            try {
                await renameGroup(selectedGroup.idGroup, data.nomeGrupo, token);

                toast.success("Grupo renomeado com sucesso.", { closeButton: true });
                onOpenChange?.(false);

                try {
                    await refresh?.();
                } catch (err) {
                    console.warn("Erro ao atualizar grupos após renomear:", err);
                }
            } catch (error) {
                console.error("Erro ao renomear grupo:", error);
                toast.error("Erro ao renomear o grupo.", { closeButton: true });
            } finally {
                setIsSubmitting(false);
            }
        } else {
            console.warn("Formulário submetido com o modal fechado");
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
                <div className="flex flex-col md:flex-row">
                    <div className="flex items-center justify-center p-6 bg-card md:w-20">
                        <div className="rounded-full bg-background p-2 shadow-md">
                            <EditIcon className="size-7 text-primary" />
                        </div>
                    </div>

                    <div className="p-6 flex-1">
                        <DialogHeader className="p-0 mb-1">
                            <DialogTitle className="text-lg font-semibold">Renomear Grupo</DialogTitle>
                        </DialogHeader>
                        <div className="text-sm text-muted-foreground mb-4">
                            <DialogDescription>
                                Informe o novo nome do grupo.
                            </DialogDescription>
                        </div>

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(alterarNomeGrupo)} className='space-y-4'>
                                <FormField
                                    control={form.control}
                                    name='nomeGrupo'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input
                                                    type='text'
                                                    className='w-full rounded-md border px-3 text-sm focus:outline-none'
                                                    placeholder='Nome do grupo'
                                                    autoFocus
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <DialogFooter className="justify-end gap-2">
                                    <Button
                                        type='button'
                                        variant="outline"
                                        onClick={() => onOpenChange?.(false)}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        type='submit'
                                        className='hover:opacity-90 cursor-pointer'
                                        disabled={
                                            !open ||
                                            !form.formState.isValid ||
                                            !isAuthenticated ||
                                            !selectedGroup
                                        }
                                    >
                                        {isSubmitting ? (
                                            <div className='flex flex-row items-center justify-center gap-2'>
                                                <Spinner />
                                                <span>Salvando...</span>
                                            </div>
                                        ) : (
                                            <span>Salvar</span>
                                        )}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}