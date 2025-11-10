"use client";

import React from "react";
import { buildColumns, Items } from "./_components/data-table/columns-item";
import { useAuth } from "@/contexts/AuthContext";
import { useGroup } from "@/contexts/GroupContext";
import getItems from "@/lib/items-controller/items";
import { Spinner } from "@/components/ui/spinner";
import DeleteItemModal from "./_components/data-table/delete-item-modal";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    useReactTable,
} from "@tanstack/react-table";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    ChevronDownIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronsLeftIcon,
    ChevronsRightIcon,
    PlusIcon,
    SearchIcon,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useDebounce } from "use-debounce";
import clsx from "clsx";

export default function ClientPage() {
    const { isAuthenticated, token } = useAuth();
    const { selectedGroup } = useGroup();
    const [data, setData] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [showDeleteModal, setShowDeleteModal] = React.useState(false);
    const [itemToDelete, setItemToDelete] = React.useState<Items | null>(null);

    // filtros / UI state
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [searchInput, setSearchInput] = React.useState<string>("");
    const [debouncedSearch] = useDebounce(searchInput, 300);
    const [dateRange, setDateRange] = React.useState<{ from?: Date; to?: Date } | undefined>(undefined);
    const [open, setOpen] = React.useState(false);

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const hasInitialized = React.useRef(false);

    // inicializa filtros a partir da URL apenas na primeira render
    React.useEffect(() => {
        if (!hasInitialized.current) {
            const search = searchParams.get("search") || "";
            const dateFrom = searchParams.get("dateFrom");
            const dateTo = searchParams.get("dateTo");

            setSearchInput(search);

            if (dateFrom || dateTo) {
                setDateRange({
                    from: dateFrom ? new Date(dateFrom) : undefined,
                    to: dateTo ? new Date(dateTo) : undefined,
                });
            }

            hasInitialized.current = true;
        }
    }, [searchParams]);

    // atualiza URL quando filtros mudam (após inicialização)
    React.useEffect(() => {
        if (!hasInitialized.current) return;

        const params = new URLSearchParams();

        if (debouncedSearch) params.set("search", debouncedSearch);
        if (dateRange?.from) params.set("dateFrom", dateRange.from.toISOString());
        if (dateRange?.to) params.set("dateTo", dateRange.to.toISOString());

        const newURL = params.toString() ? `${pathname}?${params.toString()}` : pathname;
        router.replace(newURL, { scroll: false });
    }, [debouncedSearch, dateRange, pathname, router]);

    // filtra por intervalo de datas antes de passar para a tabela
    const dataFilteredByDate = React.useMemo(() => {
        if (!dateRange || (!dateRange.from && !dateRange.to)) return data;
        return data.filter((item: any) => {
            const val = item?.updatedAt ?? item?.createdAt ?? null;
            if (!val) return false;
            const rowDate = new Date(val);
            if (isNaN(rowDate.getTime())) return false;
            if (dateRange.from && dateRange.to) {
                const start = new Date(dateRange.from);
                start.setHours(0, 0, 0, 0);
                const end = new Date(dateRange.to);
                end.setHours(23, 59, 59, 999);
                return rowDate >= start && rowDate <= end;
            }
            if (dateRange.from) {
                const only = new Date(dateRange.from);
                return rowDate.toDateString() === only.toDateString();
            }
            if (dateRange.to) {
                const only = new Date(dateRange.to);
                return rowDate.toDateString() === only.toDateString();
            }
            return true;
        });
    }, [data, dateRange]);

    // global filter (procurar por campos comuns)
    const globalFilterFn = React.useCallback((row: any, _columnId: any, filterValue: any) => {
        if (!filterValue) return true;
        const search = String(filterValue).toLowerCase();
        const fields = ["name", "description", "amount", "creator"];
        return fields.some((id) => {
            const v = row.getValue(id);
            return String(v ?? "").toLowerCase().includes(search);
        });
    }, []);

    // carregar itens do servidor
    React.useEffect(() => {
        let mounted = true;
        const load = async () => {
            if (!isAuthenticated || !selectedGroup) return;
            setLoading(true);
            try {
                const res = await getItems(selectedGroup.idGroup ?? String(selectedGroup.nameGroup), token);
                if (!mounted) return;
                setData(res ?? []);
            } catch (err: any) {
                if (!mounted) return;
                setError(err?.message ?? String(err));
            } finally {
                if (!mounted) return;
                setLoading(false);
            }
        };

        load();
        return () => { mounted = false; };
    }, [isAuthenticated, selectedGroup, token]);

    // delete flow
    const handleDelete = React.useCallback((item: Items) => {
        setItemToDelete(item);
        setShowDeleteModal(true);
    }, []);

    const columns = React.useMemo(() => buildColumns(handleDelete), [handleDelete]);

    const table = useReactTable({
        data: dataFilteredByDate,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        onGlobalFilterChange: (value) => { }, // controlado por debouncedSearch
        globalFilterFn,
        state: {
            columnFilters,
            globalFilter: debouncedSearch,
        },
    });

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
                Nenhum grupo selecionado
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header Page */}
            <div className="flex flex-col items-start">
                <h2 className="text-2xl font-semibold">Items</h2>
                <p className="text-sm text-muted-foreground mt-1">
                    Gerencie os itens do grupo <span className="font-medium">{selectedGroup?.nameGroup ?? '-'}</span>
                </p>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                <div className="flex items-center gap-3 w-full lg:w-auto">
                    <div className="relative max-w-sm w-full">
                        <div className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <SearchIcon className="size-4" aria-hidden="true" />
                        </div>
                        <Input
                            placeholder="Buscar"
                            value={searchInput}
                            onChange={(event) => setSearchInput(event.target.value)}
                            disabled={loading}
                            className="pl-9"
                        />
                    </div>

                    <Popover>
                        <PopoverTrigger asChild>
                            <div>
                                <Button
                                    variant="outline"
                                    className="data-[empty=true]:text-muted-foreground text-left font-normal"
                                >
                                    {dateRange && (dateRange.from || dateRange.to)
                                        ? dateRange.from && dateRange.to
                                            ? `${dateRange.from.toLocaleDateString()} à ${dateRange.to.toLocaleDateString()}`
                                            : dateRange.from
                                                ? `${dateRange.from.toLocaleDateString()}`
                                                : `${dateRange.to?.toLocaleDateString()}`
                                        : <span>Filtrar por data</span>
                                    }
                                    <ChevronDownIcon />
                                </Button>
                            </div>
                        </PopoverTrigger>
                        <PopoverContent>
                            <div className="flex flex-col space-y-2">
                                <Calendar
                                    mode="range"
                                    selected={dateRange as any}
                                    captionLayout="dropdown"
                                    onSelect={(range) => {
                                        if (!range) {
                                            setDateRange(undefined);
                                            return;
                                        }
                                        if (Array.isArray(range)) {
                                            setDateRange({ from: range[0], to: range[1] });
                                            return;
                                        }
                                        if ((range as any).from || (range as any).to) {
                                            setDateRange({ from: (range as any).from, to: (range as any).to });
                                            return;
                                        }
                                        if (range instanceof Date) {
                                            setDateRange({ from: range });
                                        } else {
                                            setDateRange({ from: new Date((range as unknown) as Date) });
                                        }
                                    }}
                                />
                                <div className="flex justify-between">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setDateRange(undefined)}
                                    >
                                        Limpar
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={() => setOpen(false)}
                                    >
                                        Aplicar
                                    </Button>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="flex justify-end items-center gap-3 lg:ml-4">
                    <div className="text-sm text-muted-foreground bg-muted/30 px-3 py-1 rounded-full">
                        {selectedGroup ?
                            <span>{data.length}</span>
                            :
                            <span>-</span>
                        }
                        {data.length === 1 ? ' item' : ' itens'}
                    </div>

                    {selectedGroup?.role === 'ADMIN' && (
                        <Link href={"/itens/novo-item"}>
                            <Button
                                variant="outline"
                                className="flex items-center gap-2"
                            >
                                <PlusIcon className="size-4" />
                                <span>Adicionar</span>
                            </Button>
                        </Link>
                    )}
                </div>
            </div>

            {/* Tabela dentro de card */}
            <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
                <div className="max-h-[530px] relative overflow-auto">
                    <Table>
                        <TableHeader className="bg-muted sticky top-0">
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
                                    <TableRow key={row.id} data-state={row.getIsSelected() && "selected"} className="hover:bg-muted/40 transition-colors">
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id} className={clsx(selectedGroup?.role !== 'ADMIN' && "p-0")}>
                                                {selectedGroup?.role === 'ADMIN' ? (
                                                    <>
                                                        {flexRender(
                                                            cell.column.columnDef.cell,
                                                            cell.getContext()
                                                        )}
                                                    </>
                                                ) : (
                                                    <div className="min-h-[48px] flex items-center px-2 py-3">
                                                        {flexRender(
                                                            cell.column.columnDef.cell,
                                                            cell.getContext()
                                                        )}
                                                    </div>
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-12 text-center text-sm text-muted-foreground">
                                        {loading ? 'Carregando itens...' : 'Sem resultados.'}
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

            <DeleteItemModal
                open={showDeleteModal}
                idItem={itemToDelete?.idItem ?? null}
                onOpenChange={(open) => {
                    setShowDeleteModal(open);
                    if (!open) setItemToDelete(null);
                }}
                onDeleted={(id) => {
                    setData((prev) => prev.filter((it: any) => it.idItem !== id));
                }}
            />
        </div>
    );
}