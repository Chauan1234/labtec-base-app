"use client";

import { ColumnDef } from "@tanstack/react-table";

export type Items = {
    idItem: string,
    name: string,
    description: string,
    amount: number,
    createdAt: string,
    updatedAt: string,
    creator: string,
}

export const columns: ColumnDef<Items>[] = [
    {
        accessorKey: 'name',
        header: 'Nome',
    },
    {
        accessorKey: 'description',
        header: 'Descrição',
    },
    {
        accessorKey: 'amount',
        header: 'Quantidade',
        cell: ({ row }) => (
            <span>{row.getValue('amount')}</span>
        ),
        enableSorting: true,
    },
    {
        accessorKey: 'createdAt',
        header: 'Criado em',
        cell: ({ row }) => {
            const date = new Date(row.getValue('createdAt'));
            return <span>{date.toLocaleDateString()}</span>;
        },
    },
    {
        accessorKey: 'updatedAt',
        header: 'Atualizado em',
        cell: ({ row }) => {
            const date = new Date(row.getValue('updatedAt'));
            return <span>{date.toLocaleDateString()}</span>;
        },
    },
    {
        accessorKey: 'creator',
        header: 'Criador',
        cell: ({ row }) => (
            <span>{row.getValue('creator')}</span>
        ),
        enableSorting: true,
    },
]