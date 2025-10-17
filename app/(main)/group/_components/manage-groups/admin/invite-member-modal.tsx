import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FieldGroup } from "@/components/ui/field";
import { Form, FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/contexts/AuthContext";
import { useGroup } from "@/contexts/GroupContext";
import { sendInvite } from "@/lib/group-controller/group";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

interface InviteModalProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

const baseSchema = z.object({
    email: z.email({ pattern: z.regexes.email, message: "Digite um email válido" }),
    role: z.enum(['ADMIN', 'USER']).nonoptional({ message: "A função é obrigatória" }),
})

export default function InviteModal({ open, onOpenChange }: InviteModalProps) {
    type FormValues = z.infer<typeof baseSchema>;

    const form = useForm<FormValues>({
        mode: 'onSubmit',
        reValidateMode: 'onChange',
        resolver: zodResolver(baseSchema),
        defaultValues: {
            email: '',
            role: 'USER'
        }
    });
    const [submitting, setSubmitting] = React.useState(false);

    const { token } = useAuth();
    const { selectedGroup } = useGroup();

    async function onSubmit(data: FormValues) {
        try {
            setSubmitting(true);

            await sendInvite(selectedGroup?.idGroup, data.email, data.role as 'ADMIN' | 'USER', token);

            console.log("Enviando convite para:", data.email);
            toast.success(`Convite enviado para ${data.email} com sucesso.`, { closeButton: true });

            onOpenChange?.(false);
            form.reset();
        } catch (error) {
            console.error("Erro ao enviar convite:", error);
            toast.error("Erro ao enviar convite.", { closeButton: true });
        } finally {
            setSubmitting(false);
        }
    }

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
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <FieldGroup className="max-w-xs gap-3">
                            <Label>Email</Label>
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => {
                                    return (
                                        <Input
                                            type="email"
                                            placeholder="example@gmail.com"
                                            required
                                            {...field}
                                        />
                                    )
                                }}
                            />
                            <Label className="mt-2">Função</Label>
                            <FormField
                                control={form.control}
                                name="role"
                                render={({ field }) => (
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value as string}
                                        required
                                    >
                                        <SelectTrigger className="min-w-[140px]">
                                            <SelectValue placeholder="Função" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ADMIN">Administrador</SelectItem>
                                            <SelectItem value="USER">Usuário</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </FieldGroup>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => onOpenChange?.(false)}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={submitting || !form.formState.isValid || !form.formState.isDirty}
                            >
                                {submitting
                                    ? (
                                        <>
                                            <Spinner className="size-4" />
                                            <span>Enviando...</span>
                                        </>
                                    ) : 'Enviar convite'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}