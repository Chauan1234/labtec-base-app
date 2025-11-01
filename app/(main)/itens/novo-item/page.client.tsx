"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLegend, FieldSet } from "@/components/ui/field";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input";
import { postItems } from "@/lib/items-controller/items";
import { useAuth } from "@/contexts/AuthContext";
import { useGroup } from "@/contexts/GroupContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type Resolver } from "react-hook-form";
import React from "react";
import { z } from "zod";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

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
    type FormValues = z.infer<typeof baseSchema>;

    const form = useForm<FormValues>({
        mode: "onChange",
        reValidateMode: "onChange",
        resolver: zodResolver(baseSchema) as Resolver<FormValues>,
        defaultValues: {
            name: "",
            description: "",
            amount: 0,

        },
    })

    const { isAuthenticated, token } = useAuth();
    const { selectedGroup } = useGroup();

    // Para preview ao vivo e contador de caracteres
    const watchedDescription = form.watch("description");

    const [isSubmitting, setIsSubmitting] = React.useState(false);

    async function formSubmit(values: FormValues) {
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

        const payload = {
            idGroup: selectedGroup.idGroup,
            name: values.name,
            description: values.description,
            amount: values.amount,
            token: token ?? null,
        };

        try {
            setIsSubmitting(true);
            await postItems(payload);
            form.reset();
            toast.success("Item criado com sucesso!", { closeButton: true });
        } catch (e) {
            console.error("Falha ao postar o item", e);
            toast.error("Ops! Parece que houve um problema.", { closeButton: true });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="w-full max-w-3xl mx-auto px-4">
            <div className="mb-8">
                <h1 className="text-2xl font-semibold">Criar novo item</h1>
                <p className="text-sm text-muted-foreground mt-1">Adicione um item ao grupo selecionado. Todos os campos são obrigatórios.</p>
            </div>

            <Card className="p-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(formSubmit)}>
                        <FieldGroup>
                            <FieldSet>
                                <FieldLegend>
                                    Informações do Item
                                </FieldLegend>
                                <FieldDescription>
                                    Formulário para criação de um novo item.
                                </FieldDescription>
                                <div className="space-y-4 mt-4">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Nome do item</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Digite o nome do item" maxLength={100} {...field} />
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
                                                    <Textarea placeholder="Digite a descrição do item" maxLength={255} className="max-h-30" {...field} />
                                                </FormControl>
                                                <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                                                    <div className="min-w-0">
                                                        <FormMessage />
                                                    </div>
                                                    <span className="ml-4">{(watchedDescription ?? "").length}/255</span>
                                                </div>
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
                                                        step={1}
                                                        min={0}
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="flex items-center justify-end gap-3 mt-6">
                                    <Link href="/itens">
                                        <Button variant="outline" type="button">Cancelar</Button>
                                    </Link>
                                    <Button
                                        type="submit"
                                        className="min-w-[120px]"
                                        disabled={
                                            !isAuthenticated ||
                                            !selectedGroup ||
                                            isSubmitting
                                        }
                                    >
                                        {isSubmitting ? (
                                            <div className="flex flex-row items-center gap-2">
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
                                </div>
                            </FieldSet>
                        </FieldGroup>
                    </form>
                </Form>
            </Card>
        </div>
    );
}
