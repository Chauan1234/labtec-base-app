import ManageMembers from "@/app/(main)/group/_components/manage-groups/admin/manage-members"

export const metadata = {
    title: "Membros do Grupo",
    description: "Gerencie os membros do grupo.",
}

export default function Page() {
    return (
        <div className="px-4 sm:px-6 lg:px-8">
            <ManageMembers />
        </div>
    )
}