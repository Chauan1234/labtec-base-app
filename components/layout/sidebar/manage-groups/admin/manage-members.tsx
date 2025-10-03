import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function ManageMembers() {
    return (
        <Table className="border-border rounded-md border">
            <TableHeader>
                <TableRow>
                    <TableHead>
                        Nome
                    </TableHead>
                    <TableHead>
                        Email
                    </TableHead>
                    <TableHead>
                        Nível de Acesso
                    </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                <TableRow>
                    <TableCell>
                        João Silva
                    </TableCell>
                    <TableCell>
                        joao.silva@example.com
                    </TableCell>
                    <TableCell>
                        Admin
                    </TableCell>
                </TableRow>
            </TableBody>
        </Table>
    )
}