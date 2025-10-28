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
        onGlobalFilterChange: (value) => {}, // Não usado diretamente, controlado por debouncedSearch
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
        <div className="space-y-3">
            <div className="flex flex-row justify-between gap-2">
                <div className="flex gap-3">
                    <div className="relative max-w-sm">
                        <div className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3 peer-disabled:opacity-50">
                            <SearchIcon className="size-4" aria-hidden="true" />
                        </div>
                        <Input
                            placeholder="Buscar"
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
                            <SelectItem value="USER">Membros</SelectItem>
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

            <div className="rounded-md border">
                <div className="max-h-[530px] relative overflow-auto">
                    <Table>
                        <TableHeader className="bg-muted rounded-md sticky top-0">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id} className="rounded-md">
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
                                    <TableCell colSpan={columns.length} className="h-10 text-center">
                                        Sem resultados.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Paginação */}
            <div className="flex items-center justify-between px-4 space-x-10">
                {/* Linhas por página */}
                <div className="flex flex-1 w-full items-center gap-2 lg:w-fit">
                    <Label htmlFor="rows-per-page" className="text-sm font-medium">
                        Linhas por página
                    </Label>
                    <Select
                        value={`${table.getState().pagination.pageSize}`}
                        onValueChange={(value) => {
                            table.setPageSize(Number(value));
                        }}
                    >
                        <SelectTrigger
                            size="sm"
                            className="w-auto"
                            id="rows-per-page"
                        >
                            <SelectValue placeholder={table.getState().pagination.pageSize} />
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

                {/* Informações da página */}
                <div className="flex w-fit items-center justify-center text-sm font-medium">
                    Página {table.getState().pagination.pageIndex + 1} de{" "}
                    {table.getPageCount()}
                </div>

                {/* Botões de navegação */}
                <div className="ml-auto flex items-center gap-2 lg:ml-0">
                    <Button
                        variant="outline"
                        className="size-8"
                        size="icon"
                        onClick={() => table.setPageIndex(0)}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <span className="sr-only">Primeira página</span>
                        <ChevronsLeftIcon />
                    </Button>
                    <Button
                        variant="outline"
                        className="size-8"
                        size="icon"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <span className="sr-only">Página anterior</span>
                        <ChevronLeftIcon />
                    </Button>
                    <Button
                        variant="outline"
                        className="size-8"
                        size="icon"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        <span className="sr-only">Próxima página</span>
                        <ChevronRightIcon />
                    </Button>
                    <Button
                        variant="outline"
                        className="size-8"
                        size="icon"
                        onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                        disabled={!table.getCanNextPage()}
                    >
                        <span className="sr-only">Última página</span>
                        <ChevronsRightIcon />
                    </Button>
                </div>
            </div>
            
            <InviteModal open={invite} onOpenChange={setInvite} />
        </div>
    );
}