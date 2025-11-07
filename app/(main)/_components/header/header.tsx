"use client";

// React
import React from 'react';

// Contexts
import { useAuth } from '@/contexts/AuthContext';

// UI
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { SidebarTrigger, } from '@/components/ui/sidebar';
import { LogOut, Settings } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import LogoutModal from './_components/logout-modal';


export default function AppHeader() {
    const { email, username, firstName, lastName } = useAuth();
    const [showLogout, setShowLogout] = React.useState(false);

    return (
        <>
            <header className="flex h-12 shrink-0 items-center gap-2 border-b px-6">
                <div className="flex items-center gap-2">
                    <SidebarTrigger className="cursor-pointer hover:bg-secondary/20 hover:text-primary" />
                    <Separator
                        orientation="vertical"
                        className="mr-2 data-[orientation=vertical]:h-4"
                    />
                </div>
                <div className='flex flex-1 items-center justify-end'>
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
                                onSelect={() => setShowLogout(true)}
                            >
                                <LogOut className='focus:text-destructive' />
                                Sair
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>

            <LogoutModal open={showLogout} onOpenChange={setShowLogout} />
        </>
    )
}