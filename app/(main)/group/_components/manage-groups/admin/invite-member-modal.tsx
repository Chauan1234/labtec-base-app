import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FieldGroup } from "@/components/ui/field";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

interface InviteModalProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    userRole?: 'ADMIN' | 'USER';
}

const baseSchema = z.object({
    email: z.email({ pattern: z.regexes.rfc5322Email, message: "Email inválido" }).nonempty("O email é obrigatório"),
    role: z.enum(['ADMIN', 'USER']).nonoptional("A função é obrigatória"),
})

export default function InviteModal({ open, onOpenChange, userRole }: InviteModalProps) {
    type FormValues = z.infer<typeof baseSchema>;

    const form = useForm<FormValues>({
        mode: 'onSubmit',
        reValidateMode: 'onChange',
        resolver: zodResolver(baseSchema),
        defaultValues: {
            email: '',
            role: 'USER'
        }
    })

    const [submitting, setSubmitting] = React.useState(false);

    async function onSubmit(data: FormValues) {
        if (userRole !== 'ADMIN') {
            toast.error("Você não tem permissão para convidar membros.", { closeButton: true });
            return;
        }

        try {
            setSubmitting(true);
            // chamada para enviar o convite
            console.log("Enviando convite para:", data.email);
            // await sendInvite(data.email);
            toast.success("Convite enviado com sucesso.", { closeButton: true });
            onOpenChange?.(false);
            form.reset();
        } catch (error) {
            console.error("Erro ao enviar convite:", error);
            toast.error("Erro ao enviar convite.", { closeButton: true });
        } finally {
            setSubmitting(false);
        }
    }

    React.useEffect(() => {
        if (open && userRole !== 'ADMIN') {
            onOpenChange?.(false);
        }
    }, [open, form, onOpenChange, userRole]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="space-y-2">
                <DialogHeader>
                    <DialogTitle>
                        Convidar membro
                    </DialogTitle>
                    <DialogDescription>
                        Envie um convite para que um novo membro possa participar do grupo.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                        <FieldGroup className="flex gap-3 max-w-sm">
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <FormField
                                    name="email"
                                    render={({ field }) => {
                                        return (
                                            <FormItem>
                                                <FormControl>
                                                    <Input
                                                        type="email"
                                                        placeholder="exemplo@gmail.com"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )
                                    }}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Função</Label>
                                <FormField
                                    name="role"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Select onValueChange={field.onChange} value={field.value as string}>
                                                    <SelectTrigger className="min-w-[140px]">
                                                        <SelectValue placeholder="Função" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="ADMIN">Administrador</SelectItem>
                                                        <SelectItem value="USER">Usuário</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </FieldGroup>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange?.(false)}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={submitting || !form.formState.isValid}
                            >
                                Enviar convite
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}