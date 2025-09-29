"use client";

// React
import React from "react";
import { useEffect } from "react";

// Assets
import LogoLabtec from "../../public/logo-labtec.png";
import LogoLabtecSemTexto from "../../public/logo-labtec-sem-texto.png";

// Components
import { NavMain } from "@/components/sidebar/nav-main";
import { RenomearGrupoModal } from "@/components/gerenciar_grupo/renomear-grupo-modal";

// Contexts e Libs
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";
import { useGroup, Group } from "@/contexts/GroupContext";

// UI
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuButton } from "../ui/sidebar";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "../ui/command";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
    CheckIcon,
    ChevronsUpDown,
    CirclePlus,
    EllipsisVertical,
    LayoutDashboard,
    Pencil,
    Settings,
    TableOfContents,
    Trash2,
    UserRoundCog,
} from "lucide-react";

const data = {
    NavMain: [
        {
            title: "Home",
            url: "/dashboard",
            icon: LayoutDashboard,
        },
        {
            title: "Itens",
            url: "/itens",
            icon: TableOfContents,
        }
    ],
    groups: [
        {
            value: "edumind",
            name: "Edumind",
            role: "Admin",
        },
        {
            value: "eletric-games",
            name: "Eletric Games",
            role: "Member",
        },
        {
            value: "labtec-one",
            name: "Labtec One",
            role: "Member",
        },
        {
            value: "base-app",
            name: "BaseApp",
            role: "Admin",
        },
    ]
};

export default function AppSidebar() {
    const [open, setOpen] = React.useState(false)
    const [value, setValue] = React.useState("")
    const { selectedGroup, setSelectedGroup } = useGroup();

    // estado para controlar o modal de renomear
    const [showRenomear, setShowRenomear] = React.useState(false);

    // seta o grupo inicial baseado no defaultValue do select
    useEffect(() => {
        if (!selectedGroup) {
            const g = data.groups[0] as Group;
            setSelectedGroup(g);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const { state } = useSidebar();

    return (
        <Sidebar variant="inset" collapsible="icon">
            <SidebarHeader>

                {/* Logo */}
                <SidebarMenu>
                    <SidebarMenuButton asChild className="transition-all duration-200">
                        <a href="#" className="h-auto w-auto">
                            {state === "collapsed" ? (
                                <img src={LogoLabtecSemTexto.src} alt="Logo Labtec" width={40} />
                            ) : (
                                <img src={LogoLabtec.src} alt="Logo Labtec" width={90} />
                            )}
                        </a>
                    </SidebarMenuButton>
                </SidebarMenu>

                {/* Select Group */}
                <SidebarMenu className={cn("flex items-center gap-1 min-w-0",
                    state === 'collapsed'
                        ? "flex-col"
                        : "flex-row"
                )}>
                    {data.groups.length === 0 ? (
                        <Button
                            variant="outline"
                            size="sm"
                            className={cn("p-0 text-sm font-medium justify-center cursor-pointer hover:bg-secondary/20 hover:text-primary",
                                state === "collapsed"
                                    ? "justify-center w-8 h-8 flex items-center rounded-md"
                                    : "w-full"
                            )}
                        >
                            <CirclePlus className="h-4 w-4 shrink-0" />
                            {state === "collapsed" ? null : <span>Novo Grupo</span>}
                        </Button>
                    ) : (
                        <>
                            <Popover open={open} onOpenChange={setOpen}>
                                {/* asChild agora envolve um wrapper div que controla o flex */}
                                <PopoverTrigger
                                    asChild
                                    tooltip="Selecionar grupo"
                                >
                                    {/* wrapper controla o tamanho e min-w-0 para truncar corretamente quando necessário */}
                                    <div className={cn(state === "collapsed" ? "w-auto" : "flex-1 min-w-0")}>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            role="combobox"
                                            aria-expanded={open}
                                            // botão preenche o wrapper apenas no modo expandido
                                            className={cn("p-0 text-sm font-medium justify-center cursor-pointer hover:bg-secondary/10 hover:text-primary",
                                                state === "collapsed"
                                                    ? "justify-center w-8 h-8 flex items-center rounded-md"
                                                    : "justify-between w-full",
                                            )}
                                        >
                                            {state === "collapsed" ? (
                                                <ChevronsUpDown className="h-4 w-4 shrink-0" />
                                            ) : (
                                                <>
                                                    {value ? value : (selectedGroup ? selectedGroup.name : <span>Selecionar Grupo</span>)}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </PopoverTrigger>
                                <PopoverContent
                                    side={state === 'collapsed' ? "right" : "bottom"}
                                    align="start"
                                    className="w-[210px] p-0">
                                    <Command>
                                        <CommandInput
                                            placeholder="Procurar grupo..."
                                        />
                                        <CommandList>
                                            <CommandEmpty>Nenhum grupo encontrado</CommandEmpty>
                                            <CommandGroup>
                                                {/* wrapper neutro para que o botão NÃO seja tratado como CommandItem */}
                                                <div className="!bg-transparent p-0 pt-2" role="none">
                                                    <Button
                                                        variant="outline"
                                                        className="w-full rounded-md h-7 mb-1 text-xs cursor-pointer hover:bg-secondary/20 hover:text-primary"
                                                        onPointerDown={(e) => e.stopPropagation()} // evita que o Command capture seleção/foco
                                                    >
                                                        <span>Novo Grupo</span>
                                                    </Button>
                                                </div>
                                            </CommandGroup>
                                            <CommandSeparator className="my-1" />
                                            <CommandGroup>
                                                {data.groups.map((group) => (
                                                    <CommandItem
                                                        key={group.value}
                                                        onSelect={() => {
                                                            setSelectedGroup(group);
                                                            setOpen(false);
                                                        }}
                                                        className="justify-between cursor-pointer hover:font-medium"
                                                    >
                                                        {group.name}
                                                        <CheckIcon
                                                            className={cn(
                                                                "mr-2 h-4 w-4 hover:text-primary",
                                                                group.value === selectedGroup?.value ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>

                            <DropdownMenu>
                                {/* DropdownTrigger permanece como elemento não-flex para não ser empurrado */}
                                <DropdownMenuTrigger
                                    asChild
                                    tooltip="Gerenciar grupo"
                                >
                                    <div className="flex-none">
                                        <Button
                                            variant={"outline"}
                                            size={"sm"}
                                            className={cn("p-0 w-8 h-8 cursor-pointer hover:bg-secondary/10 hover:text-primary",
                                                state === "collapsed" ? "flex items-center justify-center rounded-md" : ""
                                            )}
                                        >
                                            <EllipsisVertical className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent
                                    side="right"
                                    align="start"
                                >
                                    <DropdownMenuLabel
                                        className="text-xs text-muted-foreground text-center font-medium"
                                    >
                                        Gerenciar grupo
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {selectedGroup && selectedGroup.role === "Admin" ? (
                                        <>
                                            <DropdownMenuItem className='cursor-pointer focus:bg-secondary/20 focus:text-primary'>
                                                <UserRoundCog className='focus:text-primary' />
                                                Gerenciar membros
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className='cursor-pointer focus:bg-secondary/20 focus:text-primary'
                                                onClick={() => setShowRenomear(true)}
                                            >
                                                <Pencil className='focus:text-primary' />
                                                Renomear
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className='cursor-pointer focus:bg-secondary/20 focus:text-primary'>
                                                <Settings className='focus:text-primary' />
                                                Configurações
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className='cursor-pointer focus:bg-destructive/10 focus:text-destructive'>
                                                <Trash2 className='focus:text-destructive' />
                                                Excluir grupo
                                            </DropdownMenuItem>
                                        </>
                                    ) : (
                                        <>
                                            <DropdownMenuItem className="cursor-pointer focus:bg-secondary/10 focus:text-primary">
                                                <Settings className="focus:text-primary" />
                                                Configurações
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="cursor-pointer focus:bg-destructive/10 focus:text-destructive">
                                                <Trash2 className="focus:text-destructive" />
                                                Sair do grupo
                                            </DropdownMenuItem>
                                        </>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    )}
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={data.NavMain} />
            </SidebarContent>

            {/* Modal de renomear grupo - controlado pelo estado */}
            <RenomearGrupoModal open={showRenomear} onOpenChange={setShowRenomear} />
        </Sidebar>
    )
}