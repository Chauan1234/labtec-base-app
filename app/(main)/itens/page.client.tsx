"use client";

import React from "react";
import { buildColumns, Items } from "./_components/data-table/columns";
import { DataTable } from "./_components/data-table/data-table";
import { useAuth } from "@/contexts/AuthContext";
import { useGroup } from "@/contexts/GroupContext";
import getItems from "@/lib/items-controller/items";
import { Spinner } from "@/components/ui/spinner";
import DeleteItemModal from "./_components/data-table/delete-item-modal";

export default function ClientPage() {
    const { isAuthenticated, token } = useAuth();
    const { selectedGroup } = useGroup();
    const [data, setData] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [showDeleteModal, setShowDeleteModal] = React.useState(false);
    const [itemToDelete, setItemToDelete] = React.useState<Items | null>(null);

    const handleDelete = React.useCallback((item: Items) => {
        setItemToDelete(item);
        setShowDeleteModal(true);
    }, []);

    const columns = React.useMemo(() => buildColumns(handleDelete), [handleDelete]);

    React.useEffect(() => {
        let mounted = true;
        const load = async () => {
            if (!isAuthenticated || !selectedGroup) return;
            setLoading(true);
            try {
                const res = await getItems(selectedGroup.idGroup ?? String(selectedGroup.nameGroup), token);
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
                <>
                    <DataTable columns={columns} data={data} />
                    <DeleteItemModal
                        open={showDeleteModal}
                        idItem={itemToDelete?.idItem ?? null}
                        onOpenChange={(open) => {
                            setShowDeleteModal(open);
                            if (!open) setItemToDelete(null);
                        }}
                        onDeleted={(id) => {
                            // remove o item do estado local sem recarregar a página
                            setData((prev) => prev.filter((it: any) => it.idItem !== id));
                        }}
                    />
                </>
            )}
        </div>
    );
}
