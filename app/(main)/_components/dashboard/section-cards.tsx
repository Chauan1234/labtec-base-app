import { TrendingUpIcon, TrendingDownIcon } from "lucide-react";

import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export function SectionCards() {
    return (
        <div className="flex flex-col gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-4">
            <Card className="@container/card">
                <CardHeader>
                    <CardDescription>Receita Total</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">R$1.250,00</CardTitle>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                        Tendências em alta neste mês <TrendingUpIcon className="size-4" />
                    </div>
                    <div className="text-muted-foreground">Visitantes nos últimos 6 meses</div>
                </CardFooter>
            </Card>
            <Card className="@container/card">
                <CardHeader>
                    <CardDescription>Novos Clientes</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">1.234</CardTitle>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                        Queda de 20% neste período <TrendingDownIcon className="size-4" />
                    </div>
                    <div className="text-muted-foreground">Aquisições precisam de atenção</div>
                </CardFooter>
            </Card>
            <Card className="@container/card">
                <CardHeader>
                    <CardDescription>Contas Ativas</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">45.678</CardTitle>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                        Forte retenção de usuários <TrendingUpIcon className="size-4" />
                    </div>
                    <div className="text-muted-foreground">Engajamento excedendo as metas</div>
                </CardFooter>
            </Card>
            <Card className="@container/card">
                <CardHeader>
                    <CardDescription>Taxa de Crescimento</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">4,5%</CardTitle>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                        Aumento constante do desempenho <TrendingUpIcon className="size-4" />
                    </div>
                    <div className="text-muted-foreground">Atende às projeções de crescimento</div>
                </CardFooter>
            </Card>
        </div>
    );
}