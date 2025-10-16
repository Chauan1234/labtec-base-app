import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FieldGroup } from "@/components/ui/field";
import { Form, FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface InviteModalProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

type FormValues = {
    email: string;
    role: string;
}

export default function InviteModal({ open, onOpenChange }: InviteModalProps) {
    const form = useForm<FormValues>({ defaultValues: { email: '', role: '' } });
    const [submitting, setSubmitting] = React.useState(false);

    async function onSubmit(data: FormValues) {
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
                        <Label>Email</Label>
                        <FieldGroup className="flex flex-row gap-3 max-w-sm">
                            <FormField
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
                            <FormField
                                name="role"
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value as string}>
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
                                Enviar convite
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}