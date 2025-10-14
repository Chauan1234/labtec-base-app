"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, UserRoundX } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useGroup } from "@/contexts/GroupContext";

export type Items = {
    idItem: string,
    name: string,
    description: string,
    amount: number,
    createdAt: string,
    updatedAt: string,
    creator: string,
}

export function buildColumns(onDelete?: (item: Items) => void): ColumnDef<Items>[] {
    return [
        {
            accessorKey: 'número',
            header: 'ID',
            cell: ({ row }) => (
                <span>{row.index + 1}</span>
            ),
        },
        {
            accessorKey: 'name',
            header: 'Nome',
            filterFn: (row, columnId, filterValue) =>
                String(row.getValue(columnId)).toLowerCase().includes(String(filterValue).toLowerCase()),
        },
        {
            accessorKey: 'description',
            header: 'Descrição',
            filterFn: (row, columnId, filterValue) =>
                String(row.getValue(columnId)).toLowerCase().includes(String(filterValue).toLowerCase()),
        },
        {
            accessorKey: 'amount',
            header: 'Quantidade',
            cell: ({ row }) => (
                <span>{row.getValue('amount')}</span>
            ),
            enableSorting: true,
            filterFn: (row, columnId, filterValue) =>
                String(row.getValue(columnId)).toLowerCase().includes(String(filterValue).toLowerCase()),
        },
        {
            accessorKey: 'updatedAt',
            header: 'Atualizado',
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
            filterFn: (row, columnId, filterValue) =>
                String(row.getValue(columnId)).toLowerCase().includes(String(filterValue).toLowerCase()),
        },
        {
            id: 'actions',
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuLabel
                            className="text-xs text-muted-foreground text-center font-medium"
                        >
                            Ações
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <Link href={`/itens/${(row.original as Items).idItem}/atualizar-item`}>
                            <DropdownMenuItem>
                                Editar
                            </DropdownMenuItem>
                        </Link>
                        <DropdownMenuItem variant="destructive" onClick={() => onDelete?.(row.original as Items)}>
                            Excluir
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];
}

export type Users = {
    idUser: string,
    name: string,
    username: string,
    email: string,
    role: 'ADMIN' | 'USER',
}

export function MemberActions({
    user,
    onToggleRole,
    disabled,
}: {
    user: Users;
    onToggleRole?: (user: Users) => void;
    disabled?: boolean;
}) {
    const { firstName, lastName } = useAuth();
    const { selectedGroup } = useGroup();

    const ownerName = selectedGroup?.ownerGroup;
    const userFullName = user.name;
    const isOwner = ownerName !== "" && userFullName === ownerName;
    const isSelf = userFullName === `${firstName} ${lastName}`;

    const finalDisabled = !!disabled || isOwner || isSelf;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button 
                variant="ghost" 
                className="h-8 w-8 p-0" 
                disabled={finalDisabled} 
                title={isOwner ? "Ações indisponíveis para o owner" : undefined}
                >
                    <span className="sr-only">Abrir menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuLabel
                    className="text-xs text-muted-foreground text-center font-medium"
                >
                    Ações
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {user.role === 'ADMIN' ? (
                    <DropdownMenuItem onClick={() => !finalDisabled && onToggleRole?.(user)}>
                        Rebaixar a membro
                    </DropdownMenuItem>
                ) : (
                    <DropdownMenuItem onClick={() => !finalDisabled && onToggleRole?.(user)}>
                        Promover a admin
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export function buildColumnsManageMembers(handlers?: {
    onToggleRole?: (user: Users) => void;
}): ColumnDef<Users>[] {
    return [
        {
            accessorKey: 'nameUser',
            header: 'Nome',
        },
        {
            accessorKey: 'role',
            header: 'Função',
        },
        {
            id: 'actions',
            cell: ({ row }) => (
                <MemberActions
                    user={row.original as Users}
                    onToggleRole={handlers?.onToggleRole}
                />
            ),
        },
    ]
}