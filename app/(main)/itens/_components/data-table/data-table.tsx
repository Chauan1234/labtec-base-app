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

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
}

export function DataTable<TData, TValue>({
    columns,
    data,
}: DataTableProps<TData, TValue>) {

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
        <div className="space-y-3">
            {/* Parte de Busca e Filtros */}
            <div className="flex items-center justify-between">
                {/* Filtro Global */}
                <div className="flex items-center space-x-2">
                    <div className="relative">
                        <div className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3 peer-disabled:opacity-50">
                            <SearchIcon className="size-4" aria-hidden="true" />
                        </div>
                        <Input
                            placeholder={`Buscar`}
                            value={globalFilter}
                            onChange={(event) => {
                                table.setGlobalFilter(event.target.value);
                            }}
                            className="h-8 pl-9 max-w-sm"
                        />
                    </div>
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="data-[empty=true]:text-muted-foreground w-55 justify-between text-left font-normal"
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
                        <PopoverContent className="w-auto p-3">
                            <div className="flex flex-col space-y-2">
                                <Calendar
                                    mode="range"
                                    // o componente normalmente espera um DateRange; forçamos o cast pois gerenciamos {from,to}
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
                                    <Button variant="ghost" size="sm" onClick={() => setDateRange(undefined)}>
                                        Limpar
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
                                        Aplicar
                                    </Button>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>


                {/* Botão Adicionar */}
                <Link href={"/itens/novo-item"}>
                    <Button
                        variant={"outline"}
                        size={"sm"}
                    >
                        <PlusIcon className="h-4 w-4" />
                        Adicionar Item
                    </Button>
                </Link>
            </div>

            {/* Tabela de Dados */}
            <div className="rounded-md border">
                <div className="max-h-[530px] relative overflow-auto">
                    <Table>
                        <TableHeader className="bg-muted rounded-md sticky top-0">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => {
                                        return (
                                            <TableHead key={header.id} className="rounded-md">
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                            </TableHead>
                                        );
                                    })}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && "selected"}
                                    >
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
                                    <TableCell
                                        colSpan={columns.length}
                                        className="h-10 text-center"
                                    >
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
                    Página {table.getState().pagination.pageIndex + 1} de {" "}
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
        </div >
    );
}