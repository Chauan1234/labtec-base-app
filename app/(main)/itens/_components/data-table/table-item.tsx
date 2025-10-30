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

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
}

export function TableItem<TData, TValue>({
    columns,
    data,
}: DataTableProps<TData, TValue>) {
    const { selectedGroup } = useGroup();

    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [globalFilter, setGlobalFilter] = React.useState<string>("");
    // suporta seleção de intervalo de datas: undefined | { from?: Date; to?: Date }
    const [dateRange, setDateRange] = React.useState<{ from?: Date; to?: Date } | undefined>(undefined);
    const [open, setOpen] = React.useState(false);
    // filtra os dados pelo intervalo de datas antes de passar ao react-table
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

    // global filter fn: retorna true se ANY das colunas (OR) contiver o texto
    const globalFilterFn = React.useCallback((row: any, _columnId: any, filterValue: any) => {
        // Texto: se houver filtro de texto, o registro precisa corresponder
        if (filterValue) {
            const search = String(filterValue).toLowerCase();
            const fields = ["name", "description", "amount", "creator"];
            const matchesText = fields.some((id) => {
                const v = row.getValue(id);
                return String(v ?? "").toLowerCase().includes(search);
            });
            if (!matchesText) return false;
        }

        // Data: se houver um intervalo, o registro precisa ter 'updatedAt' entre as datas
        if (dateRange && (dateRange.from || dateRange.to)) {
            const rowVal = row.getValue("updatedAt");
            if (!rowVal) return false;
            const rowDate = new Date(rowVal);
            if (isNaN(rowDate.getTime())) return false;
            if (dateRange.from && dateRange.to) {
                const start = new Date(dateRange.from);
                start.setHours(0, 0, 0, 0);
                const end = new Date(dateRange.to);
                end.setHours(23, 59, 59, 999);
                if (rowDate < start || rowDate > end) return false;
            } else if (dateRange.from) {
                // única data selecionada: compara apenas o dia
                const only = new Date(dateRange.from);
                if (rowDate.toDateString() !== only.toDateString()) return false;
            } else if (dateRange.to) {
                const only = new Date(dateRange.to);
                if (rowDate.toDateString() !== only.toDateString()) return false;
            }
        }

        return true;
    }, [dateRange]);

    const table = useReactTable({
        data: dataFilteredByDate,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        // adiciona suporte a globalFilter controlado
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn,
        state: {
            columnFilters,
            globalFilter,
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
                    <div className="relative w-full sm:w-80">
                        <div className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <SearchIcon className="size-4" aria-hidden="true" />
                        </div>
                        <Input
                            placeholder={`Buscar`}
                            value={globalFilter}
                            onChange={(event) => {
                                table.setGlobalFilter(event.target.value);
                            }}
                            className="pl-9"
                        />
                    </div>

                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <div>
                                <Button variant="outline" className="data-[empty=true]:text-muted-foreground w-44 justify-between text-left font-normal">
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
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => setDateRange(undefined)}
                                    >
                                        Limpar
                                    </Button>
                                    <Button 
                                    variant="outline" 
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
                <div className="flex items-center gap-3">
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
                                <PlusIcon className="h-4 w-4" />
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