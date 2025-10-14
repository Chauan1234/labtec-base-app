"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { alterRoleUser, usersInGroup } from "@/lib/group-controller/group";
import { useAuth } from "@/contexts/AuthContext";
import { useGroup } from "@/contexts/GroupContext";
import React from "react";
import { toast } from "sonner";
import { MemberActions } from "@/app/(main)/itens/_components/data-table/columns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";

export default function ManageMembers() {
    const { isAuthenticated, token, firstName, lastName } = useAuth();
    const { selectedGroup } = useGroup();

    const [members, setMembers] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(false);

    async function loadMembers() {
        if (!selectedGroup) {
            setMembers([]);
            return;
        }

        setLoading(true);
        try {
            const data = await usersInGroup(selectedGroup.idGroup, token);
            setMembers(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Erro ao carregar membros do grupo:", err);
            toast.error("Erro ao carregar membros do grupo.", { closeButton: true });
            setMembers([]);
        } finally {
            setLoading(false);
        }
    }

    React.useEffect(() => {
        loadMembers();
    }, [selectedGroup, token]);

    async function handleAlterRole(u: any) {
        if (!selectedGroup || !isAuthenticated) {
            toast.error("Ação não permitida.", { closeButton: true });
            return;
        }

        // não permitir alterar role do owner
        if (selectedGroup.ownerGroup === u.name) {
            toast.error("O owner do grupo não pode ter sua função alterada.", { closeButton: true });
            return;
        }
        if (u.name === `${firstName} ${lastName}`) {
            toast.error("Você não pode alterar sua própria função.", { closeButton: true });
            return;
        }

        const newRole = u.role === 'ADMIN' ? 'USER' : 'ADMIN';
        const updated = members.map(m => m.idUser === u.idUser ? { ...m, role: newRole } : m);
        setMembers(updated);
        toast.success(`Função de ${u.username} atualizada.`, { closeButton: true });

        try {
            await alterRoleUser(selectedGroup.idGroup, u.idUser, newRole, token);
        } catch (err) {
            console.error("Erro ao alterar função do membro:", err);
            toast.error("Erro ao alterar função do membro.", { closeButton: true });
            // reverter alteração em caso de erro
            setMembers(members => members.map(m => m.idUser === u.idUser ? { ...m, role: u.role } : m));
        }
    }

    return (
        <div className="space-y-3">
            <div className="flex flex-row justify-between gap-2">
                <div className="relative max-w-sm">
                    <div className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3 peer-disabled:opacity-50">
                        <Search className="size-4" aria-hidden="true" />
                    </div>
                    <Input
                        placeholder={`Buscar`}
                        disabled={loading || members.length === 0}
                        className="h-8 pl-9"
                    />
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    disabled={loading}
                >
                    <Plus className="mr-2 size-4" />
                    <span>Adicionar Membro</span>
                </Button>
            </div>

            {/* Tabela de membros */}
            <div className="rounded-md border">
                <div className="max-h-[530px] relative overflow-auto">
                    <Table>
                        <TableHeader className="bg-muted rounded-md sticky top-0">
                            <TableRow>
                                <TableHead className="rounded-md">Nome</TableHead>
                                <TableHead>Função</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {members.map((m) => {
                                const ownerName = selectedGroup?.ownerGroup;
                                const memberName = m.nameUser;
                                const isMemberOwner = ownerName === memberName;
                                const isSelf = memberName === `${firstName} ${lastName}`;

                                return (
                                    <TableRow key={m.idUser}>
                                        <TableCell>{m.username}</TableCell>
                                        <TableCell>{m.role.toLowerCase()}</TableCell>
                                        <TableCell>{m.email}</TableCell>
                                        <TableCell>
                                            <MemberActions
                                                user={m}
                                                onToggleRole={handleAlterRole}
                                                disabled={isMemberOwner || isSelf}
                                            />
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    )
}