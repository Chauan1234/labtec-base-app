"use client";

// Contexts
import { useAuth } from '@/contexts/AuthContext';
import { useGroup } from '@/contexts/GroupContext';

// UI
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { SidebarInset, SidebarTrigger, } from '@/components/ui/sidebar';
import { EllipsisVertical, LogOut, Pencil, Settings, Trash2, UserRoundCog } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';


export default function Page() {
    const { email, username, firstName, lastName, logout } = useAuth();
    const { selectedGroup } = useGroup();
    console.log({ email, firstName, lastName, username });

    return (
        <>
            {/* Criação da page arredondada */}
            <SidebarInset>

                {/* Header */}
                <header className="flex h-12 shrink-0 items-center gap-2 border-b px-6">
                    <div className="flex items-center gap-2">
                        <SidebarTrigger className="cursor-pointer" />
                        <Separator
                            orientation="vertical"
                            className="mr-2 data-[orientation=vertical]:h-4"
                        />
                        <DropdownMenu>
                            <DropdownMenuTrigger>
                                {selectedGroup ? (
                                    <Button variant="ghost" size="sm" className="!p-0 cursor-pointer hover:text-secondary hover:bg-muted/50">
                                        <span className='text-sm font-medium ml-2'>{selectedGroup.name}</span>

                                        {selectedGroup.role == "Admin" ? (
                                            <EllipsisVertical className='inline-block ml-1 mr-1 cursor-pointer' size={14} />
                                        ) :
                                            null
                                        }
                                    </Button>
                                ) : (
                                    <div className="text-sm text-muted-foreground">Nenhum grupo selecionado</div>
                                )}
                            </DropdownMenuTrigger>
                            <DropdownMenuContent side="bottom">
                                <DropdownMenuLabel className='text-xs text-muted-foreground text-center font-medium'>Gerenciar grupo</DropdownMenuLabel>
                                <DropdownMenuSeparator />

                                <DropdownMenuItem className='cursor-pointer focus:bg-secondary/10 focus:text-secondary'>
                                    <UserRoundCog className='focus:text-secondary' />
                                    Gerenciar membros
                                </DropdownMenuItem>
                                <DropdownMenuItem className='cursor-pointer focus:bg-secondary/10 focus:text-secondary'>
                                    <Pencil className='focus:text-secondary' />
                                    Renomear
                                </DropdownMenuItem>
                                <DropdownMenuItem className='cursor-pointer focus:bg-secondary/10 focus:text-secondary'>
                                    <Settings className='focus:text-secondary' />
                                    Configurações
                                </DropdownMenuItem>
                                <DropdownMenuItem className='cursor-pointer focus:bg-destructive/10 focus:text-destructive'>
                                    <Trash2 className='focus:text-destructive' />
                                    Excluir grupo
                                </DropdownMenuItem>

                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <div className='flex flex-1 items-center justify-end'>
                        <DropdownMenu>
                            <DropdownMenuTrigger>
                                <Avatar className='cursor-pointer'>
                                    <AvatarFallback>
                                        {firstName && lastName ? `${firstName.charAt(0)}${lastName.charAt(0)}` : username?.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent side="bottom" align="end">
                                <DropdownMenuLabel className='flex items-center gap-2'>
                                    <Avatar>
                                        <AvatarFallback>
                                            {firstName && lastName ? `${firstName.charAt(0)}${lastName.charAt(0)}` : username?.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className='flex flex-col'>
                                        <span className='text-sm font-medium'>{username}</span>
                                        <span className="text-xs font-normal text-muted-foreground">{email}</span>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className='focus:bg-secondary/10 focus:text-secondary cursor-pointer'>
                                    <Settings className='focus:text-secondary' />
                                    Configurações
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={logout} className='focus:bg-destructive/10 focus:text-destructive cursor-pointer'>
                                    <LogOut className='focus:text-destructive' />
                                    Sair
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>
            </SidebarInset>
        </>
    )
}