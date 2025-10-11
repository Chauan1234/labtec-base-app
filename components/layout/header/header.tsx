"use client";

// React
import React from 'react';

// Contexts
import { useAuth } from '@/contexts/AuthContext';
import { useGroup } from '@/contexts/GroupContext';

// UI
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { SidebarTrigger, } from '@/components/ui/sidebar';
import { CircleAlert, LogOut, Moon, Settings } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import Link from 'next/link';
import ThemeSwitcher from './_components/theme-switcher';


export default function AppHeader() {
    const { email, username, firstName, lastName, logout } = useAuth();
    const { selectedGroup } = useGroup();
    const [confirmOpen, setConfirmOpen] = React.useState(false);

    return (
        <>
            {/* Header */}
            <header className="flex h-12 shrink-0 items-center gap-2 border-b px-6">
                <div className="flex items-center gap-2">
                    <SidebarTrigger className="cursor-pointer hover:bg-secondary/20 hover:text-primary" />
                    <Separator
                        orientation="vertical"
                        className="mr-2 data-[orientation=vertical]:h-4"
                    />
                </div>
                <div className='flex flex-1 items-center justify-end'>
                    <ThemeSwitcher />
                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <Avatar className='cursor-pointer rounded-lg'>
                                <AvatarFallback className='rounded-lg'>
                                    {firstName && lastName ? `${firstName.charAt(0)}${lastName.charAt(0)}` : username?.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="bottom" align="end">
                            <DropdownMenuLabel className='flex items-center gap-2'>
                                <Avatar className='rounded-lg'>
                                    <AvatarFallback className='rounded-lg'>
                                        {firstName && lastName ? `${firstName.charAt(0)}${lastName.charAt(0)}` : username?.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className='flex flex-col'>
                                    <span className='text-sm font-medium'>{username}</span>
                                    <span className="text-xs font-normal text-muted-foreground">{email}</span>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <Link href="/user-config/" passHref>
                                <DropdownMenuItem>
                                    <Settings className='focus:text-primary' />
                                    Configurações
                                </DropdownMenuItem>
                            </Link>
                            <DropdownMenuItem
                                variant='destructive'
                                onSelect={() => setConfirmOpen(true)}
                            >
                                <LogOut className='focus:text-destructive' />
                                Sair
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                {/* Dialog controlado para Logout (fora do Dropdown) */}
                <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                    <DialogContent className='gap-0 sm:max-w-[284px]'>
                        <DialogHeader className='flex items-center mb-3 gap-1'>
                            <DialogTitle className='flex flex-col items-center gap-1'>
                                <CircleAlert className='h-5 w-5 text-destructive' />
                                <span>Sair da sua conta?</span>
                            </DialogTitle>
                            <DialogDescription className='text-center text-sm text-muted-foreground mt-1 mb-3'>
                                Será necessário fazer login de novo para acessar seus grupos.
                            </DialogDescription>
                        </DialogHeader>
                        <Button
                            variant="logout"
                            size={"sm"}
                            className='mb-2 cursor-pointer'
                            onClick={logout}
                        >
                            Sair
                        </Button>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button
                                    variant="outline"
                                    size={"sm"}
                                    className='w-full hover:bg-secondary/20 hover:text-primary cursor-pointer'>
                                    Cancelar
                                </Button>
                            </DialogClose>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </header>
        </>
    )
}