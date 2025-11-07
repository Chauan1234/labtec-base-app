import { ChartAreaInteractive } from "./(main)/_components/dashboard/chart-area"
import { SectionCards } from "./(main)/_components/dashboard/section-cards"


export const metadata = {
    title: "Dashboard",
    description: "Página inicial do sistema.",
}

export default function PageDashboard() {

    return (
        <div className="@container/main flex flex-col gap-4 md:gap-6">
            <SectionCards />

            <ChartAreaInteractive />
        </div>
    )
}