"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLegend, FieldSet } from "@/components/ui/field";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useGroup } from "@/contexts/GroupContext";
import { putItem, getItems } from "@/lib/items-controller/items";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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

    const router = useRouter();
    const params = useParams();
    const idItem = Array.isArray(params?.idItem) ? params?.idItem[0] : params?.idItem;

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
    const [loadingItem, setLoadingItem] = React.useState(false);

    React.useEffect(() => {
        let mounted = true;
        const load = async () => {
            if (!isAuthenticated || !selectedGroup || !idItem) return;
            setLoadingItem(true);
            try {
                const items = await getItems(selectedGroup.idGroup, token);
                if (!mounted) return;
                const found = (items ?? []).find((it: any) => it.idItem === idItem);
                if (!found) {
                    toast.error("Item não encontrado.");
                    router.push('/itens');
                    return;
                }
                form.reset({
                    name: found.name ?? "",
                    description: found.description ?? "",
                    amount: found.amount ?? 0,
                });
            } catch (e) {
                console.error('Erro ao carregar item:', e);
                toast.error('Erro ao carregar item.');
            } finally {
                if (mounted) setLoadingItem(false);
            }
        };
        load();
        return () => { mounted = false; };
    }, [isAuthenticated, selectedGroup, idItem, token]);

    async function formSubmit(values: FormValues) {
        if (!isAuthenticated) {
            toast.error('Usuário não autenticado');
            return;
        }
        if (!selectedGroup) {
            toast.error('Nenhum grupo selecionado');
            return;
        }
        if (!idItem) {
            toast.error('ID do item inválido');
            return;
        }

        try {
            setIsSubmitting(true);
            await putItem(selectedGroup.idGroup, idItem, { ...values, token });
            toast.success("Item atualizado com sucesso.");
            router.push('/itens');
        } catch (e) {
            console.error("Erro ao atualizar item:", e);
            toast.error("Erro ao atualizar o item.");
        } finally {
            setIsSubmitting(false);
        }
    }

    if (!isAuthenticated) {
        return (
            <div className="flex flex-row items-center justify-center gap-2 px-4 sm:px-6 lg:px-8">
                <Spinner />
                Aguardando autenticação...
            </div>
        );
    }

    if (!selectedGroup) {
        return (
            <div className="flex items-center justify-center px-4 sm:px-6 lg:px-8">
                Selecione um grupo
            </div>
        );
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
                                    ) : (
                                        "Atualizar item"
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
