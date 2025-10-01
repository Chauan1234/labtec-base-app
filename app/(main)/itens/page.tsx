import { columns } from "./_components/data-table/columns";
import { DataTable } from "./_components/data-table/data-table";
import data from "./data.json";

export default async function ItensPage() {

    return (
        <div className="px-4 sm:px-6 lg:px-8">
            <DataTable columns={columns} data={data} />
        </div>
    );
}
