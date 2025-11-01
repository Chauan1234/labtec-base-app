import { ColumnDef } from "@tanstack/react-table";
import { LogOutIcon, MoreHorizontalIcon, UserRoundMinusIcon, UserRoundPlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/AuthContext";
import { useGroup } from "@/contexts/GroupContext";

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

    if (selectedGroup?.role !== 'ADMIN') {
        return null;
    }

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
                    <MoreHorizontalIcon className="h-4 w-4" />
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
                        <UserRoundMinusIcon className="size-4 hover:text-primary" />
                        Rebaixar a membro
                    </DropdownMenuItem>
                ) : (
                    <DropdownMenuItem onClick={() => !finalDisabled && onToggleRole?.(user)}>
                        <UserRoundPlusIcon className="size-4 hover:text-primary" />
                        Promover a admin
                    </DropdownMenuItem>
                )}
                <DropdownMenuItem variant="destructive" onClick={() => !finalDisabled && onToggleRole?.(user)}>
                    <LogOutIcon className="size-4" />
                    Remover do grupo
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export function buildColumnsManageMembers(
    handlers?: {
        onToggleRole?: (user: Users) => void;
    },
    selectedGroupRole?: 'ADMIN' | 'USER'
): ColumnDef<Users>[] {
    const cols: ColumnDef<Users>[] = [
        {
            accessorKey: 'número',
            header: 'ID',
            cell: ({ row }) => (
                <span>{row.index + 1}</span>
            ),
        },
        {
            accessorKey: 'username',
            header: 'Nome',
            filterFn: (row, columnId, filterValue) =>
                String(row.getValue(columnId)).toLowerCase().includes(String(filterValue).toLowerCase()),
        },
        {
            accessorKey: 'role',
            header: 'Função',
            cell: ({ row }) => (
                <span>{row.getValue<string>('role').toLowerCase()}</span>
            ),
        },
        {
            accessorKey: 'email',
            header: 'Email',
            filterFn: (row, columnId, filterValue) =>
                String(row.getValue(columnId)).toLowerCase().includes(String(filterValue).toLowerCase()),
        }
    ]
    if (selectedGroupRole === 'ADMIN') {
        cols.push({
            id: 'actions',
            cell: ({ row }) => (
                <MemberActions
                    user={row.original}
                    onToggleRole={handlers?.onToggleRole}
                />
            )
        })
    }

    return cols;
}