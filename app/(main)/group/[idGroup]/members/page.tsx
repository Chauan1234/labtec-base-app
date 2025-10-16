import ClientPage from "./page.client"

export const metadata = {
    title: "Membros do Grupo",
    description: "Gerencie os membros do grupo.",
}

export default function Page() {
    return (
        <div className="px-4 sm:px-6 lg:px-8">
            <ClientPage />
        </div>
    )
}