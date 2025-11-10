import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/contexts/AuthContext";
import { useGroup } from "@/contexts/GroupContext";
import { createGroup } from "@/lib/group-controller/group";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

interface NovoGrupoModalProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

const baseSchema = z.object({
    nomeGrupo: z.string().min(3, "O nome deve ter no mínimo 3 caracteres").max(50, "O nome' deve ter no máximo 50 caracteres").nonempty("O nome do grupo é obrigatório"),
})

export default function NovoGrupoModal({ open, onOpenChange }: NovoGrupoModalProps) {
    const { isAuthenticated, token } = useAuth();
    const { selectedGroup, refresh } = useGroup();

    const [isSubmitting, setIsSubmitting] = React.useState(false);

    type FormValues = z.infer<typeof baseSchema>;

    const form = useForm<FormValues>({
        mode: 'onChange',
        reValidateMode: 'onChange',
        resolver: zodResolver(baseSchema),
        defaultValues: {
            nomeGrupo: '',
        }
    })

    React.useEffect(() => {
        if (open) {
            form.reset();
        } else {
            form.clearErrors();
        }
    }, [open, form])

    async function novoGrupo(data: FormValues) {
        if (open) {
            if (!isAuthenticated) {
                toast.error('Você precisa estar logado para criar um grupo.');
                return;
            }
            if (!selectedGroup) {
                toast.error('Nenhum grupo selecionado.');
                return;
            }

            setIsSubmitting(true);
            try {
                await createGroup(data.nomeGrupo, token);

                toast.success('Grupo criado com sucesso!');
                onOpenChange?.(false);
                form.reset();

                try {
                    await refresh?.();
                } catch (error) {
                    console.error("Erro ao atualizar grupos após criar novo grupo:", error);
                }
            } catch (error) {
                console.error("Erro ao criar grupo:", error);
                toast.error('Erro ao criar grupo.');
            } finally {
                setIsSubmitting(false);
            }
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
                <div className="flex flex-col md:flex-row">
                    <div className="flex items-center justify-center p-6 bg-card md:w-20">
                        <div className="rounded-full bg-background p-2 shadow-md">
                            <PlusIcon className="size-7 text-primary" />
                        </div>
                    </div>

                    <div className="p-6 flex-1">
                        <DialogHeader className="p-0 mb-1">
                            <DialogTitle className="text-lg font-semibold">Criar Novo Grupo</DialogTitle>
                        </DialogHeader>
                        <div className="text-sm text-muted-foreground mb-4">
                            <DialogDescription>
                                Informe o nome do novo grupo que deseja criar.
                            </DialogDescription>
                        </div>

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(novoGrupo)} className='space-y-4'>
                                <FormField
                                    control={form.control}
                                    name='nomeGrupo'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input
                                                    type="text"
                                                    className='w-full rounded-md border px-3 text-sm focus:outline-none'
                                                    placeholder="Nome do grupo"
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