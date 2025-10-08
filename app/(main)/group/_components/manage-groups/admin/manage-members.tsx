import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { membersGroup } from "@/lib/group-controller/group";
import { buildColumnsManageMembers } from "@/app/(main)/itens/_components/data-table/columns";

export default function ManageMembers() {
    return (
        <Table className="border-border rounded-md border">
            <TableHeader>
                <TableRow>
                    {buildColumnsManageMembers().map((column) => (
                        <TableHead key={column.id}>
                            {column.header}
                        </TableHead>
                    ))}
                </TableRow>
            </TableHeader>
            <TableBody>
                {membersGroup.map((member) => (
                    <TableRow key={member.idUser}>
                        <TableCell>
                            {member.nameUser}
                        </TableCell>
                        <TableCell>
                            {member.email}
                        </TableCell>
                        <TableCell>
                            {member.role}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}