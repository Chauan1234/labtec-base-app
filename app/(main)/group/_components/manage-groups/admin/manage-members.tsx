"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { alterRoleUser, usersInGroup } from "@/lib/group-controller/group";
import { useAuth } from "@/contexts/AuthContext";
import { useGroup } from "@/contexts/GroupContext";
import React from "react";
import { toast } from "sonner";
import { MemberActions } from "@/app/(main)/itens/_components/data-table/columns";

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
        if (selectedGroup.owner === `${firstName} ${lastName}`) {
            toast.error("O owner do grupo não pode ter sua função alterada.", { closeButton: true });
            return;
        }

        const newRole = u.role === 'ADMIN' ? 'USER' : 'ADMIN';
        const updated = members.map(m => m.idUser === u.idUser ? { ...m, role: newRole } : m);
        setMembers(updated);
        toast.success(`Função de ${u.nameUser} atualizada.`, { closeButton: true });

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
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Função</TableHead>
                    <TableHead></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {members.map((m) => (
                    <TableRow key={m.idUser}>
                        <TableCell>{m.nameUser}</TableCell>
                        <TableCell>{m.role.toLowerCase()}</TableCell>
                        <TableCell>
                            <MemberActions
                                user={m}
                                onToggleRole={handleAlterRole}
                                disabled={!!selectedGroup && m.idUser === selectedGroup.owner}
                            />
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}