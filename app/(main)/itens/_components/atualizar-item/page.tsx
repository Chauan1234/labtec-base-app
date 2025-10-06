import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLegend, FieldSet } from "@/components/ui/field";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useGroup } from "@/contexts/GroupContext";
import { putItem } from "@/lib/items-controller/items";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";
import { useForm, type Resolver } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const _baseSchema = z.object({
    name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres.").max(100, "Nome deve ter no máximo 100 caracteres.").nonempty("Nome é obrigatório."),
    description: z.string().min(3, "Descrição deve ter pelo menos 3 caracteres.").max(255, "Descrição deve ter no máximo 255 caracteres.").nonempty("Descrição é obrigatória."),
    amount: z.preprocess((val) => {
        if (typeof val === "string") {
            const trimmed = val.trim();
            if (trimmed === "") return undefined;
            const n = Number(trimmed);
            return Number.isNaN(n) ? val : n;
        }
        return val;
    }, z.number().min(0, "Quantidade deve ser um número positivo.").int("Quantidade deve ser um número inteiro.")),
});

const formSchema = _baseSchema.refine((data) => data.amount !== undefined, {
    message: "Quantidade é obrigatória",
    path: ["amount"],
});

export default function Page() {
    type FormValues = z.infer<typeof formSchema>;

    const form = useForm<FormValues>({
        mode: "onChange",
        reValidateMode: "onChange",
        resolver: zodResolver(formSchema) as unknown as Resolver<FormValues>,
        defaultValues: {
            name: "",
            description: "",
            amount: 0,
        },
    });

    const { isAuthenticated, token } = useAuth();
    const { selectedGroup } = useGroup();

    const [isSubmitting, setIsSubmitting] = React.useState(false);

    async function formSubmit(values: FormValues) {
        // precaução extra: garantir autenticação e seleção de grupo
        if (!isAuthenticated) {
            console.warn("Tentativa de criar item sem estar autenticado");
            return;
        }
        if (!selectedGroup) {
            console.warn("Nenhum grupo selecionado ao tentar criar o item");
            return;
        }

        if (values.amount === undefined) {
            console.warn("Quantidade está indefinida, isso não deveria acontecer devido à validação");
            return;
        }

        try {
            setIsSubmitting(true);
            await putItem(selectedGroup.idGroup, idItem, { name: values.name, description: values.description, amount: values.amount, token });
            toast.success("Item atualizado com sucesso.", { closeButton: true });
            redirect("/itens");
        } catch (e) {
            console.error("Erro ao atualizar item:", e);
            toast.error("Erro ao atualizar o item.", { closeButton: true });
        }
    }

    return (
        <div className="w-full max-w-md">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(formSubmit)}>
                    <FieldGroup>
                        <FieldSet>
                            <FieldLegend>
                                Atualizar Item
                            </FieldLegend>
                            <FieldDescription>
                                Atualize as informações do item abaixo.
                            </FieldDescription>
                            <FieldGroup>
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nome do item</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Nome do item" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Descrição do item</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Digite a descrição do item" maxLength={255} className="max-h-45 max-w-auto" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="amount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Quantidade</FormLabel>
                                            <FormControl>
                                                <Input type="number" maxLength={16} placeholder="Digite a quantidade" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </FieldGroup>
                            <Field orientation={"horizontal"}>
                                <Button
                                    type="submit"
                                    className="mt-4"
                                    disabled={!isAuthenticated || !selectedGroup || isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <div className="flex flex-row items-center gap-1">
                                            <Spinner />
                                            <span>Enviando...</span>
                                        </div>
                                    ) : isAuthenticated && selectedGroup ? (
                                        "Criar item"
                                    ) : !isAuthenticated && selectedGroup ? (
                                        <div className="flex flex-row items-center gap-1">
                                            <Spinner />
                                            <span>Autenticando...</span>
                                        </div>
                                    ) : (
                                        "Selecione um grupo"
                                    )}
                                </Button>
                                <Link href="/itens">
                                    <Button
                                        variant={"outline"}
                                        type="button"
                                        className="mt-4 ml-2"
                                    >
                                        Cancelar
                                    </Button>
                                </Link>
                            </Field>
                        </FieldSet>
                    </FieldGroup>
                </form>
            </Form>
        </div>
    );
}

function zodResolver(formSchema: any): unknown {
    throw new Error("Function not implemented.");
}
