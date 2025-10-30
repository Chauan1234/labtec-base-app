"use client";

// React e Next
import React from "react";
import Link from "next/link";
import Image from "next/image";
import Package from '../../../package.json';

// Components
import { SairGrupoModal } from "@/app/(main)/group/_components/manage-groups/member/leave-group-modal";
import { ExcluirGrupoModal } from "@/app/(main)/group/_components/manage-groups/admin/delete-group-modal";
import { RenomearGrupoModal } from "@/app/(main)/group/_components/manage-groups/admin/rename-group-modal";

// Assets
import LogoLabtec from "@/public/logo-labtec-sem-texto.png";

// Contexts e Libs
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";
import { useGroup } from "@/contexts/GroupContext";

// UI Components
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SidebarMenu, SidebarMenuButton } from "@/components/ui/sidebar";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    CheckIcon,
    ChevronsUpDownIcon,
    EllipsisVerticalIcon,
    LogOutIcon,
    PencilIcon,
    SettingsIcon,
    Trash2Icon,
    UserIcon,
    UserRoundCogIcon,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function NavHeader({
    groups
}: {
    groups: {
        idGroup: string;
        nameGroup: string;
        ownerGroup: string;
        role: 'ADMIN' | 'USER';
    }[]
}) {
    // hooks
    const { firstName, lastName } = useAuth();
    const { state, isMobile } = useSidebar();
    const { selectedGroup, setSelectedGroup } = useGroup();

    // estados para controlar o popover
    const [open, setOpen] = React.useState(false);
    const [value, setValue] = React.useState("");

    // estados para controlar os modais
    const [showRenomear, setShowRenomear] = React.useState(false);
    const [showExcluir, setShowExcluir] = React.useState(false);
    const [showSair, setShowSair] = React.useState(false);

    return (
        <>
            {/* Logo */}
            <SidebarMenu>
                <SidebarMenuButton asChild className="transition-all duration-200">
                    <Link href="/dashboard" className="h-auto w-auto">
                        {state === "collapsed" ? (
                            <Image src={LogoLabtec.src} alt="Logo Labtec" width={40} height={40} />
                        ) : (
                            <div className="flex flex-row items-center gap-2">
                                <Image src={LogoLabtec.src} alt="Logo Labtec" width={40} height={40} />
                                <div className="flex flex-col justify-between">
                                    <span className="text-base">
                                        Base
                                        <span className="text-primary">
                                            App
                                        </span>
                                    </span>
                                    <span className="text-xs text-muted-foreground">v{Package.version}</span>
                                </div>
                            </div>
                        )}
                    </Link>
                </SidebarMenuButton>
            </SidebarMenu>

            {/* Select Group */}
            <SidebarMenu className={cn("flex items-center gap-2 min-w-0",
                state === 'collapsed'
                    ? "flex-col"
                    : "flex-row"
            )}>
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
                                        <ChevronsUpDownIcon className="h-4 w-4 shrink-0" />
                                    ) : (
                                        <>
                                            {value ? value : (selectedGroup ? selectedGroup.nameGroup : <span>Selecionar Grupo</span>)}
                                            <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
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
                                        <div className="!bg-transparent p-0 pt-2" role="none">
                                            <Button
                                                variant="outline"
                                                className="w-full rounded-md h-7 mb-1 text-xs"
                                                onPointerDown={(e) => e.stopPropagation()} // evita que o Command capture seleção/foco
                                            >
                                                <span>Novo Grupo</span>
                                            </Button>
                                        </div>
                                    </CommandGroup>
                                    <CommandSeparator className="my-1" />
                                    <CommandGroup>
                                        {groups.map((group) => (
                                            <CommandItem
                                                key={group.idGroup}
                                                onSelect={() => {
                                                    setSelectedGroup(group);
                                                    setOpen(false);
                                                }}
                                                className="justify-between cursor-pointer hover:font-medium"
                                            >
                                                {group.nameGroup}
                                                <CheckIcon
                                                    className={cn(
                                                        "mr-2 size-4 hover:text-primary",
                                                        group.idGroup === selectedGroup?.idGroup ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>

                    {/* Menu de gerenciar grupo */}
                    <DropdownMenu>

                        {/* Botão para ativar o menu de gerenciar grupo */}
                        <DropdownMenuTrigger
                            asChild
                            tooltip="Gerenciar grupo"
                        >
                            <div className="flex-none">
                                <Button
                                    variant={"outline"}
                                    size={"sm"}
                                    className={cn("p-0 w-8 h-8",
                                        state === "collapsed" ? "flex items-center justify-center rounded-md" : ""
                                    )}
                                >
                                    <EllipsisVerticalIcon className="h-4 w-4" />
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
                            {selectedGroup && selectedGroup.role === 'ADMIN' ? (
                                <>
                                    <Link href={`/group/${selectedGroup.idGroup}/members`}>
                                        <DropdownMenuItem>
                                            <UserRoundCogIcon className='focus:text-primary' />
                                            Gerenciar membros
                                        </DropdownMenuItem>
                                    </Link>
                                    <DropdownMenuItem onClick={() => setShowRenomear(true)}>
                                        <PencilIcon className='focus:text-primary' />
                                        Renomear
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <SettingsIcon className='focus:text-primary' />
                                        Configurações
                                    </DropdownMenuItem>
                                </>
                            ) : (
                                <>
                                    <Link href={`/group/${selectedGroup?.idGroup}/members`}>
                                        <DropdownMenuItem>
                                            <UserIcon className="focus:text-primary" />
                                            Visualizar membros
                                        </DropdownMenuItem>
                                    </Link>
                                </>
                            )}
                            {selectedGroup && selectedGroup.ownerGroup === `${firstName} ${lastName}` ? (
                                <DropdownMenuItem
                                    variant="destructive"
                                    onClick={() => setShowExcluir(true)}
                                >
                                    <Trash2Icon />
                                    Excluir grupo
                                </DropdownMenuItem>
                            ) : (
                                <DropdownMenuItem
                                    variant="destructive"
                                    onClick={() => setShowSair(true)}
                                >
                                    <LogOutIcon />
                                    Sair do grupo
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    {/* Modais controlados */}
                    <RenomearGrupoModal open={showRenomear} onOpenChange={setShowRenomear} />
                    <ExcluirGrupoModal open={showExcluir} onOpenChange={setShowExcluir} />
                    <SairGrupoModal open={showSair} onOpenChange={setShowSair} />
                </>
            </SidebarMenu>
        </>
    );
}