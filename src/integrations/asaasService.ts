const ASAAS_BASE_URL = import.meta.env.VITE_ASAAS_BASE_URL;
const ASAAS_TOKEN = import.meta.env.VITE_ASAAS_TOKEN;

export const asaasService = {
    async createCustomer(customer: {
        name: string;
        cpfCnpj: string;
        email?: string;
        mobilePhone?: string;
    }) {
        const res = await fetch('/asaas/customers', {
            method: "POST",
            headers: {
                accept: "application/json",
                "content-type": "application/json",
                access_token: ASAAS_TOKEN!,
            },
            body: JSON.stringify(customer),
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.errors?.[0]?.description || "Erro ao criar cliente no Asaas");
        }

        return res.json();
    },

    async listCustomers() {
        const res = await fetch('/asaas/customers', {
            headers: {
                accept: "application/json",
                access_token: ASAAS_TOKEN!,
            },
        });

        return res.json();
    },

    async deleteCustomer(customerId: string) {
        const res = await fetch(`/asaas/customers/${customerId}`, {
            method: "DELETE",
            headers: {
                accept: "application/json",
                access_token: ASAAS_TOKEN!,
            },
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.errors?.[0]?.description || "Erro ao excluir cliente no Asaas");
        }

        return res.json();
    }
};
