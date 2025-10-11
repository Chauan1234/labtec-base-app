// React
import React from 'react';

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
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { FieldGroup } from '@/components/ui/field';
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

export function RenomearGrupoModal({ open, onOpenChange }: RenomearGrupoModalProps) {
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
    const { isAuthenticated, token } = useAuth();
    const { selectedGroup, refresh } = useGroup();

    // Estado de botão de envio do formulário
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    React.useEffect(() => {
        // quando o modal abrir, preencher o form com o nome atual do grupo
        if (open) {
            form.reset({
                nomeGrupo: selectedGroup?.nameGroup ?? '',
            })
        } else {
            // quando fechar, limpar erros e resetar (assim evita de mostrar erros ao reabrir)
            form.clearErrors();
            form.reset({
                nomeGrupo: '',
            });
        }
    }, [open, selectedGroup, form])

    async function formSubmit(data: FormValues) {
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
                // chamada para renomear o grupo
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
            <Form {...form}>
                <DialogContent className='gap-0 sm:max-w-[360px]'>
                    <form onSubmit={form.handleSubmit(formSubmit)}>
                        <FieldGroup className='gap-3'>
                            <DialogHeader className='mb-2 gap-0'>
                                <DialogTitle className='flex items-center gap-2'>
                                    <CircleAlert className='h-5 w-5 text-primary' />
                                    <span>Renomear grupo</span>
                                </DialogTitle>
                                <DialogDescription className='text-sm text-muted-foreground mt-1'>
                                    Informe o novo nome do grupo.
                                </DialogDescription>
                            </DialogHeader>
                            <FieldGroup>
                                <FormField
                                    control={form.control}
                                    name="nomeGrupo"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input
                                                    type='text'
                                                    className='w-full rounded-md border px-3 text-sm focus:outline-none'
                                                    placeholder='Nome do grupo'
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </FieldGroup>
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
                                    type='submit'
                                    variant="default"
                                    size="sm"
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
                        </FieldGroup>
                    </form>
                </DialogContent>
            </Form>
        </Dialog >
    )
}