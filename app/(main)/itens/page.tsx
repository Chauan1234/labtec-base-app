import { columns, Items } from "./_components/data-table/columns";
import { DataTable } from "./_components/data-table/data-table";

async function getItems(): Promise<Items[]> {
    return [
        {
            idItem: '1',
            name: 'Item 1',
            description: 'Descrição do Item 1',
            amount: 10,
            createdAt: '2023-10-01',
            updatedAt: '2023-10-02',
            creator: 'Usuário A',
        },
        {
            idItem: '2',
            name: 'Item 2',
            description: 'Descrição do Item 2',
            amount: 5,
            createdAt: '2023-10-03',
            updatedAt: '2023-10-04',
            creator: 'Usuário B',
        },
    ]
}

export default async function ItensPage() {
    const items = await getItems();

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Itens</h1>
            <DataTable columns={columns} data={items} />
        </div>
    );
}
