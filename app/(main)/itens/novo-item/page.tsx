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
    }, z.number().min(0, "A quantidade deve ser um número positivo.").int("A quantidade deve ser um número inteiro.").optional()),
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
    })

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
            toast.error("Ops! Parece que houve um problema.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="w-full max-w-md">
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
                            <FieldGroup>
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <Field>
                                            <FormItem>
                                                <FormLabel>Nome do item</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Digite o nome do item" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        </Field>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <Field>
                                                <FormLabel>Descrição do item</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Digite a descrição do item" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </Field>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="amount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <Field>
                                                <FormLabel>Quantidade</FormLabel>
                                                <FormControl>
                                                    <Input type="number" placeholder="Digite a quantidade" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </Field>
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