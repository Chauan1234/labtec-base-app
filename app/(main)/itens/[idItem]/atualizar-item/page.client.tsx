"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLegend, FieldSet } from "@/components/ui/field";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useGroup } from "@/contexts/GroupContext";
import React from "react";
import { putItem, getItems } from "@/lib/items-controller/items";
import { toast } from "sonner";
import { useRouter, useParams } from "next/navigation";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const baseSchema = z.object({
    name: z.string()
        .min(3, "O nome do item deve ter pelo menos 3 caracteres")
        .max(100, "O nome do item deve ter no máximo 100 caracteres")
        .nonempty("O nome do item é obrigatório"),
    description: z.string()
        .min(3, "A descrição do item deve ter pelo menos 3 caracteres")
        .max(255, "A descrição do item deve ter no máximo 255 caracteres")
        .nonempty("A descrição do item é obrigatória"),
    amount: z.union([z.string(), z.number()])
        .refine((val) => {
            if (val === "" || val === null || val === undefined) {
                return false;
            }
            return true;
        }, {
            message: "A quantidade é obrigatória"
        })
        .transform((val) => {
            if (typeof val === "string") {
                const num = Number(val);
                if (isNaN(num)) {
                    throw new Error("A quantidade deve ser um número válido");
                }
                return num;
            }
            return val;
        })
        .refine((val) => val >= 0, {
            message: "A quantidade deve ser um número positivo"
        })
        .refine((val) => Number.isInteger(val), {
            message: "A quantidade deve ser um número inteiro"
        })
        .refine((val) => val <= 999999999, {
            message: "A quantidade deve ter no máximo 9 dígitos"
        })
});

export default function ClientPage() {
    const router = useRouter();

    const params = useParams();
    const idItem = Array.isArray(params.idItem) ? params.idItem[0] : params.idItem;

    type FormValues = z.input<typeof baseSchema>;

    const form = useForm<FormValues>({
        mode: "onChange",
        reValidateMode: "onChange",
        resolver: zodResolver(baseSchema),
        defaultValues: {
            name: "",
            description: "",
            amount: "",
        }
    })

    const { isAuthenticated, token } = useAuth();
    const { selectedGroup } = useGroup();

    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [loading, setLoading] = React.useState(false);

    React.useEffect(() => {
        async function loadItem() {
            if (!selectedGroup || !idItem) {
                setLoading(false);
                return;
            }
            setLoading(true);

            try {
                const items = await getItems(selectedGroup.idGroup, token);
                const item = Array.isArray(items) ? items.find((i: any) => i.idItem === idItem) : null;

                if (item) {
                    form.reset({
                        name: item.name ?? "",
                        description: item.description ?? "",
                        amount: String(item.amount ?? ""),
                    });
                } else {
                    toast.error("Item não encontrado.", { closeButton: true });
                    router.push("/itens");
                }
            } catch (error) {
                console.error("Erro ao carregar item:", error);
                toast.error("Erro ao carregar o item.", { closeButton: true });
                router.push("/itens");
            } finally {
                setLoading(false);
            }
        }
        loadItem();
    }, [idItem, selectedGroup, token]);

    async function formSubmit(data: FormValues) {
        if (!isAuthenticated || !selectedGroup || !idItem) return;

        setIsSubmitting(true);
        try {
            const validatedData = baseSchema.parse(data);

            await putItem(selectedGroup.idGroup, idItem, { ...validatedData, token });
            toast.success("Item atualizado com sucesso.", { closeButton: true });
            router.push("/itens");
        } catch (error) {
            console.error("Erro ao atualizar item:", error);
            toast.error("Erro ao atualizar o item.", { closeButton: true });
        } finally {
            setIsSubmitting(false);
        }
    }

    if (loading) {
        return (
            <div className="w-full max-w-md flex items-center justify-center">
                <Spinner />
            </div>
        )
    }

    return (
        <div className="w-full max-w-md">
            <Form {...form} >
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
                                                <Textarea
                                                    placeholder="Digite a descrição do item"
                                                    maxLength={255}
                                                    className="max-h-45 max-w-auto"
                                                    {...field}
                                                />
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
                                                <Input
                                                    type="number"
                                                    placeholder="Digite a quantidade"
                                                    {...field}
                                                />
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
            </Form >
        </div >
    )
}
