"use client";
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
    SidebarInset,
    SidebarTrigger,
} from '@/components/ui/sidebar'
import { useAuth } from '@/contexts/AuthContext';
import { AvatarFallback } from '@radix-ui/react-avatar';
import { DropdownMenuLabel } from '@radix-ui/react-dropdown-menu';
import { Ellipsis, Pencil, Trash2 } from 'lucide-react'

const groups = [
    {
        id: 1,
        name: "Edumind",
        role: "Admin",
    },
    {
        id: 2,
        name: "Eletric Games",
        role: "Member",
    },
    {
        id: 3,
        name: "Labtec One",
        role: "Member",
    },
    {
        id: 4,
        name: "BaseApp",
        role: "Admin",
    },
]


export default function Page() {
    const { email, username, firstName, lastName, logout } = useAuth();
    console.log({ email, firstName, lastName, username });

    return (
        <>
            <SidebarInset>
                <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
                    <div className="flex items-center gap-2 px-2">
                        <SidebarTrigger className="-ml-1 cursor-pointer" />
                        <Separator
                            orientation="vertical"
                            className="mr-2 data-[orientation=vertical]:h-4"
                        />
                        <Select>
                            <SelectTrigger className="w-[180px]" size="sm">
                                <SelectValue placeholder="Selecione um Grupo" />
                            </SelectTrigger>
                            <SelectContent position="popper">
                                <Button className="w-full rounded-md h-7 mb-1 text-xs cursor-pointer" variant="outline">
                                    Novo Grupo
                                </Button>
                                <SelectGroup>
                                    <SelectLabel>Grupos</SelectLabel>
                                    {groups.map((group) => (
                                        <SelectItem
                                            key={group.id}
                                            value={group.name}
                                            className='focus:bg-muted/80'
                                            trailing={
                                                group.role === "Admin" ? (
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger>
                                                            <button onClick={(e) => e.stopPropagation()} className='p-1 rounded-md cursor-pointer hover:bg-muted-foreground/10'>
                                                                <Ellipsis />
                                                            </button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent side='right' align='start'>
                                                            <DropdownMenuItem className='focus:bg-secondary/10 focus:text-secondary hover:cursor-pointer'>
                                                                <Pencil className='hover:text-secondary' />
                                                                <span>Editar</span>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem className='focus:bg-destructive/10 focus:text-destructive hover:cursor-pointer'>
                                                                <Trash2 className='hover:text-destructive' />
                                                                <span>Deletar</span>
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                ) : undefined
                                            }
                                        >
                                            {group.name}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <DropdownMenu>
                            <DropdownMenuTrigger>
                                <Avatar>
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
                                        <span>{username}</span>
                                        <span className="text-xs text-muted-foreground">{email}</span>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>

                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>
            </SidebarInset>
        </>
    )
}
