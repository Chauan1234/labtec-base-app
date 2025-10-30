"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { alterRoleUser, usersInGroup } from "@/lib/group-controller/group";
import { useAuth } from "@/contexts/AuthContext";
import { useGroup } from "@/contexts/GroupContext";
import React from "react";
import { toast } from "sonner";
import { buildColumnsManageMembers, Users } from "../../_components/data-table/columns-manage-group";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MailPlusIcon, SearchIcon, ChevronLeftIcon, ChevronRightIcon, ChevronsLeftIcon, ChevronsRightIcon } from "lucide-react";
import InviteModal from "../../_components/manage-groups/admin/invite-member-modal";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useDebounce } from "use-debounce";
import {
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    useReactTable,
} from "@tanstack/react-table";
//Quero ir pra casa não aguento mais tá aqui

export default function ClientPage() {
    const { isAuthenticated, token, firstName, lastName } = useAuth();
    const { selectedGroup } = useGroup();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [members, setMembers] = React.useState<Users[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [invite, setInvite] = React.useState(false);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [roleFilter, setRoleFilter] = React.useState<string>("all");

    // Input de busca e debounce
    const [searchInput, setSearchInput] = React.useState<string>("");
    const [debouncedSearch] = useDebounce(searchInput, 300);

    // Flag para controlar se já inicializou os filtros da URL
    const hasInitialized = React.useRef(false);

    // Inicializar filtros a partir da URL APENAS na primeira montagem
    React.useEffect(() => {
        if (!hasInitialized.current) {
            const search = searchParams.get('search') || '';
            const role = searchParams.get('role') || 'all';
            setSearchInput(search);
            setRoleFilter(role);
            hasInitialized.current = true;
        }
    }, []);

    // Atualizar URL quando os filtros mudarem
    React.useEffect(() => {
        // Só atualiza URL após a inicialização
        if (!hasInitialized.current) return;

        const params = new URLSearchParams();
        if (debouncedSearch) params.set('search', debouncedSearch);
        if (roleFilter && roleFilter !== 'all') params.set('role', roleFilter);

        const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
        router.replace(newUrl, { scroll: false });
    }, [debouncedSearch, roleFilter, pathname, router]);

    // Filtro global que busca por nome e email
    const globalFilterFn = React.useCallback((row: any, _columnId: any, filterValue: any) => {
        if (!filterValue) return true;

        const search = String(filterValue).toLowerCase();
        const username = String(row.getValue('username') ?? '').toLowerCase();
        const email = String(row.getValue('email') ?? '').toLowerCase();

        return username.includes(search) || email.includes(search);
    }, []);

    // Filtrar dados por role
    const filteredData = React.useMemo(() => {
        if (roleFilter === 'all') return members;
        return members.filter(m => m.role === roleFilter.toUpperCase());
    }, [members, roleFilter]);

    // Definir colunas usando buildColumnsManageMembers
    const columns = React.useMemo(() =>
        buildColumnsManageMembers({
            onToggleRole: handleAlterRole,
        }),
        []);

    const table = useReactTable({
        data: filteredData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: (value) => { }, // Não usado diretamente, controlado por debouncedSearch
        globalFilterFn,
        state: {
            columnFilters,
            globalFilter: debouncedSearch,
        },
    });

    async function loadMembers() {
        if (!selectedGroup) {
            setMembers([]);
            return;
        }

        if (selectedGroup.role && selectedGroup.role !== "ADMIN") return;

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

    React.useEffect(() => {
        loadMembers();
    }, [selectedGroup, token]);

    async function handleAlterRole(u: Users) {
        if (!selectedGroup || !isAuthenticated) {
            toast.error("Ação não permitida.", { closeButton: true });
            return;
        }

        if (selectedGroup.ownerGroup === u.name) {
            toast.error("O owner do grupo não pode ter sua função alterada.", { closeButton: true });
            return;
        }
        if (u.name === `${firstName} ${lastName}`) {
            toast.error("Você não pode alterar sua própria função.", { closeButton: true });
            return;
        }

        const newRole: 'ADMIN' | 'USER' = u.role === 'ADMIN' ? 'USER' : 'ADMIN';

        // Atualização otimista
        const updated = members.map(m => m.idUser === u.idUser ? { ...m, role: newRole } : m);
        setMembers(updated);
        toast.success(`Função de ${u.username} atualizada.`, { closeButton: true });

        try {
            await alterRoleUser(selectedGroup.idGroup, u.idUser, newRole, token);
            // Recarregar os dados do servidor após sucesso
            await loadMembers();
        } catch (err) {
            console.error("Erro ao alterar função do membro:", err);
            toast.error("Erro ao alterar função do membro.", { closeButton: true });
            // Reverter para o estado anterior em caso de erro
            setMembers(members);
        }
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Membros</h1>
                    <p className="text-sm text-muted-foreground mt-1">Gerencie os membros do grupo <span className="font-medium">{selectedGroup?.nameGroup ?? "-"}</span></p>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                <div className="flex items-center gap-3 w-full lg:w-auto">
                    <div className="relative max-w-sm w-full">
                        <div className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <SearchIcon className="size-4" aria-hidden="true" />
                        </div>
                        <Input
                            placeholder="Buscar por nome ou email"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            disabled={loading || members.length === 0}
                            className="pl-9"
                        />
                    </div>

                    <Select value={roleFilter} onValueChange={setRoleFilter} disabled={loading || members.length === 0}>
                        <SelectTrigger className="w-[155px] h-8">
                            <SelectValue placeholder="Função" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas</SelectItem>
                            <SelectItem value="ADMIN">Administradores</SelectItem>
                            <SelectItem value="USER">Usuários</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex justify-end items-center gap-3 lg:ml-4">
                    <div className="text-sm text-muted-foreground bg-muted/30 px-3 py-1 rounded-full">
                        {selectedGroup ?
                            <span>{members.length}</span>
                            :
                            <span>-</span>
                        }
                        {members.length === 1 ? ' membro' : ' membros'}
                    </div>
                    <Button
                        variant="outline"
                        disabled={loading}
                        onClick={() => setInvite(true)}
                        className="flex items-center gap-2"
                    >
                        <MailPlusIcon className="mr-0 size-4" />
                        <span>Convidar</span>
                    </Button>
                </div>
            </div>

            {/* Tabela dentro de card */}
            <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
                <div className="max-h-[530px] relative overflow-auto">
                    <Table>
                        <TableHeader className="bg-muted sticky top-0 z-10">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id}>
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-12 text-center text-sm text-muted-foreground">
                                        {loading ? 'Carregando membros...' : 'Sem resultados.'}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Paginação */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 px-1">
                <div className="flex items-center gap-3">
                    <Label htmlFor="rows-per-page" className="text-sm font-medium">
                        Linhas por página
                    </Label>
                    <Select
                        value={`${table.getState().pagination.pageSize}`}
                        onValueChange={(value) => {
                            table.setPageSize(Number(value));
                        }}
                    >
                        <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                            <SelectValue placeholder={`${table.getState().pagination.pageSize}`} />
                        </SelectTrigger>
                        <SelectContent side="top">
                            {[10, 25, 50, 100].map((pageSize) => (
                                <SelectItem key={pageSize} value={`${pageSize}`}>
                                    {pageSize}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-sm font-medium">
                        Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => table.setPageIndex(0)}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <span className="sr-only">Primeira página</span>
                            <ChevronsLeftIcon />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <span className="sr-only">Página anterior</span>
                            <ChevronLeftIcon />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            <span className="sr-only">Próxima página</span>
                            <ChevronRightIcon />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                            disabled={!table.getCanNextPage()}
                        >
                            <span className="sr-only">Última página</span>
                            <ChevronsRightIcon />
                        </Button>
                    </div>
                </div>
            </div>

            <InviteModal open={invite} onOpenChange={setInvite} />
        </div>
    );
}