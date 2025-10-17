// ...existing code...
"use client";

import { alterRoleUser, usersInGroup } from "@/lib/group-controller/group";
import { useAuth } from "@/contexts/AuthContext";
import { useGroup } from "@/contexts/GroupContext";
import React from "react";
import { toast } from "sonner";
import { buildColumnsManageMembers, Users } from "@/app/(main)/_components/columns";
import InviteModal from "../../_components/manage-groups/admin/invite-member-modal";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
    ColumnFiltersState,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon, ChevronsLeftIcon, ChevronsRightIcon, MailPlusIcon, SearchIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function ClientPage() {
    const { isAuthenticated, token, firstName, lastName } = useAuth();
    const { selectedGroup } = useGroup();
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const [members, setMembers] = React.useState<Users[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [invite, setInvite] = React.useState(false);

    // URL params (strings)
    const searchParam = searchParams.get("search") || "";
    const roleParam = searchParams.get("role") || "ALL";
    const pageParam = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const pageSizeParam = parseInt(searchParams.get("pageSize") || "10");

    // local controlled inputs
    const [searchInputValue, setSearchInputValue] = React.useState<string>(searchParam);
    const [roleFilter, setRoleFilter] = React.useState<string>(roleParam);

    async function loadMembers() {
        if (!selectedGroup) {
            setMembers([]);
            return;
        }

        if (selectedGroup.role && selectedGroup.role !== "ADMIN") {
            setMembers([]);
            return;
        }

        setLoading(true);
        try {
            const data = await usersInGroup(selectedGroup.idGroup, token);
            setMembers(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Erro ao carregar membros do grupo:", err);
            toast.error("Erro ao carregar membros do grupo.", { closeButton: true });
            setMembers([]);
        } finally {
            setLoading(false);
        }
    }

    React.useEffect(() => {
        loadMembers();
    }, [selectedGroup, token]);

    React.useEffect(() => {
        if (!selectedGroup) return;
        if (!isAuthenticated) {
            router.push("/dashboard");
            return;
        }

        if (selectedGroup.role && selectedGroup.role !== "ADMIN") {
            toast.error("Acesso negado: apenas administradores podem gerenciar membros.", { closeButton: true });
            router.push("/dashboard");
        }
    }, [selectedGroup, isAuthenticated, router]);

    const handleAlterRole = React.useCallback(async (u: Users) => {
        if (!selectedGroup || !isAuthenticated) {
            toast.error("Ação não permitida.", { closeButton: true });
            return;
        }
        if (selectedGroup.ownerGroup === u.nameUser) {
            toast.error("O owner do grupo não pode ter sua função alterada.", { closeButton: true });
            return;
        }
        if (u.nameUser === `${firstName} ${lastName}`) {
            toast.error("Você não pode alterar sua própria função.", { closeButton: true });
            return;
        }

        const newRole = u.role === 'ADMIN' ? 'USER' : 'ADMIN';
        const updated = members.map(m => m.idUser === u.idUser ? { ...m, role: newRole } : m);
        setMembers(updated);
        toast.success(`Função de ${u.username} alterada para ${newRole} com sucesso.`, { closeButton: true });

        try {
            await alterRoleUser(selectedGroup.idGroup, u.idUser, newRole, token);
        } catch (err) {
            console.error("Erro ao alterar função do membro:", err);
            toast.error("Erro ao alterar função do membro.", { closeButton: true });

            // reverter alteração em caso de erro
            setMembers(members => members.map(m => m.idUser === u.idUser ? { ...m, role: u.role } : m));
        }
    }, [selectedGroup, isAuthenticated, members, firstName, lastName, token]);

    const columns = React.useMemo(() => buildColumnsManageMembers({ onToggleRole: handleAlterRole }), [handleAlterRole]);

    // global filter function que considera roleFilter + busca em username/email
    const globalFilterFn = React.useCallback((row: any, _columnId: any, filterValue: any) => {
        const search = String(filterValue || "").toLowerCase();
        if (search) {
            const username = String(row.getValue("username") ?? "").toLowerCase();
            const email = String(row.getValue("email") ?? "").toLowerCase();
            if (!username.includes(search) && !email.includes(search)) return false;
        }

        if (roleFilter && roleFilter !== "ALL") {
            const role = String(row.getValue("role") ?? "");
            if (role !== roleFilter) return false;
        }

        return true;
    }, [roleFilter]);

    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [globalFilter, setGlobalFilter] = React.useState<string>(searchParam);

    const table = useReactTable({
        data: members,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn,
        state: {
            columnFilters,
            globalFilter,
        },
        initialState: {
            pagination: {
                pageIndex: Math.max(0, pageParam - 1),
                pageSize: pageSizeParam || 10,
            },
        },
    });

    // Debounce input to avoid over-updating URL
    React.useEffect(() => {
        const t = setTimeout(() => {
            // set global filter in table (re-renders and filters)
            table.setGlobalFilter(searchInputValue);
            // reset to first page when searching
            table.setPageIndex(0);
        }, 250);
        return () => clearTimeout(t);
    }, [searchInputValue, table]);

    // when roleFilter changes we re-evaluate table and reset to first page
    React.useEffect(() => {
        table.setPageIndex(0);
    }, [roleFilter, table]);

    // Sync table state -> URL (page/pageSize/search/role)
    React.useEffect(() => {
        const pageIndex = table.getState().pagination.pageIndex ?? 0;
        const pageSize = table.getState().pagination.pageSize ?? 10;
        const params = new URLSearchParams(searchParams.toString());

        if (globalFilter) params.set("search", globalFilter);
        else params.delete("search");

        if (roleFilter && roleFilter !== "ALL") params.set("role", roleFilter);
        else params.delete("role");

        params.set("page", String(pageIndex + 1));
        params.set("pageSize", String(pageSize));

        const newQs = params.toString();
        const curQs = searchParams.toString();
        if (newQs !== curQs) {
            router.replace(`${pathname}?${newQs}`, { scroll: false });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        table.getState().pagination.pageIndex,
        table.getState().pagination.pageSize,
        globalFilter,
        roleFilter,
        searchParams.toString(),
    ]);

    // Sync URL -> table when user navigates / manual URL change
    React.useEffect(() => {
        const spSearch = searchParams.get("search") || "";
        const spRole = searchParams.get("role") || "ALL";
        const spPage = Math.max(1, parseInt(searchParams.get("page") || "1"));
        const spSize = parseInt(searchParams.get("pageSize") || "10");

        if (globalFilter !== spSearch) {
            setGlobalFilter(spSearch);
            setSearchInputValue(spSearch);
            table.setGlobalFilter(spSearch);
        }

        if (roleFilter !== spRole) setRoleFilter(spRole);

        const desiredPageIndex = Math.max(0, spPage - 1);
        if (table.getState().pagination.pageIndex !== desiredPageIndex) {
            table.setPageIndex(desiredPageIndex);
        }
        if (table.getState().pagination.pageSize !== spSize) {
            table.setPageSize(spSize);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams.toString()]);

    // handlers for UI controls (select/input)
    function handleRoleSelect(value: string) {
        setRoleFilter(value);
    }

    function handlePageSizeChange(value: string) {
        table.setPageSize(Number(value));
        table.setPageIndex(0); // reset page
    }

    return (
        <div className="space-y-3">
            <div className="flex flex-row justify-between gap-2">
                <div className="flex flex-row gap-3">
                    <div className="relative max-w-sm">
                        <div className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3 peer-disabled:opacity-50">
                            <SearchIcon className="size-4" aria-hidden="true" />
                        </div>
                        <Input
                            placeholder={`Buscar`}
                            disabled={loading || members.length === 0}
                            className="pl-9"
                            value={searchInputValue}
                            onChange={(e) => setSearchInputValue(e.target.value)}
                        />
                    </div>
                    <Select
                        value={roleFilter}
                        onValueChange={(value) => handleRoleSelect(value)}
                        disabled={loading || members.length === 0}
                    >
                        <SelectTrigger className="min-w-[140px]">
                            <SelectValue placeholder="Função" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Todos</SelectItem>
                            <SelectItem value="ADMIN">Administrador</SelectItem>
                            <SelectItem value="USER">Usuário</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <Button
                    variant="outline"
                    disabled={loading}
                    onClick={() => setInvite(true)}
                >
                    <MailPlusIcon className="mr-1 size-4" />
                    <span>Convidar</span>
                </Button>
            </div>

            {/* Tabela de membros (usando TanStack Table local) */}
            <div className="rounded-md border">
                <div className="max-h-[530px] relative overflow-auto">
                    <Table>
                        <TableHeader className="bg-muted rounded-md sticky top-0">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id} className="rounded-md">
                                            {header.isPlaceholder ? null : header.column.columnDef.header instanceof Function
                                                ? header.column.columnDef.header(header.getContext())
                                                : header.column.columnDef.header}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="text-center text-muted-foreground">
                                        {loading ? "Carregando..." : "Nenhum membro encontrado"}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id}>
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {cell.column.columnDef.cell instanceof Function
                                                    ? cell.column.columnDef.cell(cell.getContext())
                                                    : String(cell.getValue())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Paginação (comportamento igual ao data-table) */}
            <div className="flex items-center justify-between px-4 space-x-10">
                <div className="flex flex-1 w-full items-center gap-2 lg:w-fit">
                    <Label htmlFor="rows-per-page" className="text-sm font-medium">Linhas por página</Label>
                    <Select
                        value={`${table.getState().pagination.pageSize}`}
                        onValueChange={(value) => handlePageSizeChange(value)}
                    >
                        <SelectTrigger size="sm" className="w-auto" id="rows-per-page">
                            <SelectValue placeholder={table.getState().pagination.pageSize} />
                        </SelectTrigger>
                        <SelectContent side="top">
                            {[10, 25, 50, 100].map((ps) => (
                                <SelectItem key={ps} value={`${ps}`}>{ps}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex w-fit items-center justify-center text-sm font-medium">
                    Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
                </div>

                <div className="ml-auto flex items-center gap-2 lg:ml-0">
                    <Button variant="outline" size="icon" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>
                        <span className="sr-only">Primeira página</span>
                        <ChevronsLeftIcon />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                        <span className="sr-only">Página anterior</span>
                        <ChevronLeftIcon />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                        <span className="sr-only">Próxima página</span>
                        <ChevronRightIcon />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}>
                        <span className="sr-only">Última página</span>
                        <ChevronsRightIcon />
                    </Button>
                </div>
            </div>

            <InviteModal open={invite} onOpenChange={setInvite} />
        </div>
    );
}