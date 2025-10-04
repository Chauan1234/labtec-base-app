"use client";

import React from "react";
import { columns } from "./_components/data-table/columns";
import { DataTable } from "./_components/data-table/data-table";
import { useAuth } from "@/contexts/AuthContext";
import { useGroup } from "@/contexts/GroupContext";
import getItems from "@/lib/items-controller/items";
import { Spinner } from "@/components/ui/spinner";

export default function ItensPage() {
    const { isAuthenticated, token } = useAuth();
    const { selectedGroup } = useGroup();
    const [data, setData] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        let mounted = true;
        const load = async () => {
            if (!isAuthenticated || !selectedGroup) return;
            setLoading(true);
            try {
                const res = await getItems(selectedGroup.idGroup ?? String(selectedGroup.name), token);
                if (!mounted) return;
                setData(res ?? []);
            } catch (err: any) {
                if (!mounted) return;
                setError(err?.message ?? String(err));
            } finally {
                if (!mounted) return;
                setLoading(false);
            }
        };

        load();

        return () => {
            mounted = false;
        };
    }, [isAuthenticated, selectedGroup, token]);

    if (!isAuthenticated) {
        return (
            <div className="flex flex-row items-center justify-center gap-2 px-4 sm:px-6 lg:px-8">
                <Spinner />
                Aguardando autenticação...
            </div>
        );
    }

    if (!selectedGroup) {
        return (
            <div className="flex items-center justify-center px-4 sm:px-6 lg:px-8">
                Nenhum grupo selecionado
            </div>
        );
    }

    return (
        <div className="px-4 sm:px-6 lg:px-8">
            {loading ? (
                <div>Carregando itens...</div>
            ) : error ? (
                <div className="text-destructive">Erro: {error}</div>
            ) : (
                <DataTable columns={columns} data={data} />
            )}
        </div>
    );
}
