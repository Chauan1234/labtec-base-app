"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    ColumnDef,
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
import { useGroup } from "@/contexts/GroupContext";
import clsx from "clsx";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useDebounce } from "use-debounce";
import { date } from "zod";

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
}

export function TableItem<TData, TValue>({
    columns,
    data,
}: DataTableProps<TData, TValue>) {
    const { selectedGroup } = useGroup();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

    // Input de busca e debounce
    const [searchInput, setSearchInput] = React.useState<string>("");
    const [debouncedSearch] = useDebounce(searchInput, 300);

    // Estado para intervalo de datas
    const [dateRange, setDateRange] = React.useState<{ from?: Date; to?: Date } | undefined>(undefined);
    const [open, setOpen] = React.useState(false);

    // Flag para controlar se já inicializou os filtros da URL
    const hasInitialized = React.useRef(false);

    // Inicializar filtros a partir da URL APENAS na primeira renderização
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
    }, []);

    // Atualiza URL quando os filtros mudarem
    React.useEffect(() => {
        // Só atualiza URL após a inicialização
        if (!hasInitialized.current) return;

        const params = new URLSearchParams();

        if (debouncedSearch) {
            params.set("search", debouncedSearch);
        }

        if (dateRange?.from) {
            params.set("dateFrom", dateRange.from.toISOString());
        }

        if (dateRange?.to) {
            params.set("dateTo", dateRange.to.toISOString());
        }

        const newURL = params.toString() ? `${pathname}?${params.toString()}` : pathname;
        router.replace(newURL, { scroll: false });
    }, [debouncedSearch, dateRange, pathname, router]);

    // Filtra os dados pelo intervalo de datas antes de passar ao react-table
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

    // Global filter fn: retorna true se ANY das colunas (OR) contiver o texto
    const globalFilterFn = React.useCallback((row: any, _columnId: any, filterValue: any) => {
        if (!filterValue) return true;

        const search = String(filterValue).toLowerCase();
        const fields = ["name", "description", "amount", "creator"];
        return fields.some((id) => {
            const v = row.getValue(id);
            return String(v ?? "").toLowerCase().includes(search);
        });
    }, []);

    const table = useReactTable({
        data: dataFilteredByDate,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        onGlobalFilterChange: (value) => { }, // Controlado por debouncedSearch
        globalFilterFn,
        state: {
            columnFilters,
            globalFilter: debouncedSearch,
        },
    });

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start">
                <div>
                    <h2 className="text-2xl font-semibold">Itens</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Gerencie os itens do grupo <span className="font-medium">{selectedGroup?.nameGroup ?? '-'}</span></p>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative max-w-sm w-full">
                        <div className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <SearchIcon className="size-4" aria-hidden="true" />
                        </div>
                        <Input
                            placeholder="Buscar"
                            value={searchInput}
                            onChange={(event) => setSearchInput(event.target.value)}
                            className="pl-9"
                        />
                    </div>

                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <div>
                                <Button variant="outline" className="data-[empty=true]:text-muted-foreground w-[208px] justify-between text-left font-normal">
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
                        <PopoverContent className="w-auto p-3">
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

                <div className="flex justify-end items-center gap-3 md:ml-4">
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
                            <Button variant="outline" className="flex items-center gap-2">
                                <PlusIcon className="size-4" />
                                <span>Adicionar</span>
                            </Button>
                        </Link>
                    )}
                </div>
            </div>

            {/* Tabela */}
            <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
                <div className="max-h-[530px] relative overflow-auto">
                    <Table>
                        <TableHeader className="bg-muted sticky top-0 z-10">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
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
                                    <TableCell colSpan={columns.length} className="h-12 text-center text-sm text-muted-foreground">Sem resultados.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Paginação */}
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-3">
                    <Label htmlFor="rows-per-page" className="text-sm font-medium">Linhas por página</Label>
                    <Select value={`${table.getState().pagination.pageSize}`} onValueChange={(value) => table.setPageSize(Number(value))}>
                        <SelectTrigger size="sm" className="w-20" id="rows-per-page"><SelectValue placeholder={`${table.getState().pagination.pageSize}`} /></SelectTrigger>
                        <SelectContent side="top">{[10, 25, 50, 100].map(ps => <SelectItem key={ps} value={`${ps}`}>{ps}</SelectItem>)}</SelectContent>
                    </Select>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-sm font-medium">Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}</div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}><span className="sr-only">Primeira página</span><ChevronsLeftIcon /></Button>
                        <Button variant="outline" size="icon" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}><span className="sr-only">Página anterior</span><ChevronLeftIcon /></Button>
                        <Button variant="outline" size="icon" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}><span className="sr-only">Próxima página</span><ChevronRightIcon /></Button>
                        <Button variant="outline" size="icon" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}><span className="sr-only">Última página</span><ChevronsRightIcon /></Button>
                    </div>
                </div>
            </div>
        </div>
    );
}