const ASAAS_BASE_URL = import.meta.env.VITE_ASAAS_BASE_URL;
const ASAAS_TOKEN = import.meta.env.VITE_ASAAS_TOKEN;

export const asaasService = {
    async createCustomer(customer: {
        name: string;
        cpfCnpj: string;
        email?: string;
        mobilePhone?: string;
    }, apiKey?: string) {
        const res = await fetch('/asaas/customers', {
            method: "POST",
            headers: {
                accept: "application/json",
                "content-type": "application/json",
                access_token: apiKey ?? ASAAS_TOKEN,
            },
            body: JSON.stringify(customer),
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.errors?.[0]?.description || "Erro ao criar cliente no Asaas");
        }

        return res.json();
    },

    async deletePayment(paymentId: string, apiKey: string) {
        const res = await fetch(`/asaas/payments/${paymentId}`, {
            method: "DELETE",
            headers: {
                accept: "application/json",
                "content-type": "application/json",
                access_token: apiKey ?? ASAAS_TOKEN,
            },
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(
                err.errors?.[0]?.description || "Erro ao remover cobrança no Asaas"
            );
        }

        return res.json();
    },

    async deleteCustomer(customerId: string, apiKey: string) {
        const res = await fetch(`/asaas/customers/${customerId}`, {
            method: "DELETE",
            headers: {
                accept: "application/json",
                access_token: apiKey ?? ASAAS_TOKEN,
            },
        },);

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.errors?.[0]?.description || "Erro ao excluir cliente no Asaas");
        }

        return res.json();
    },

    async createSubAccount(data: any) {
        const response = await fetch(`/asaas/accounts`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                access_token: ASAAS_TOKEN!,
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Erro ao criar subconta no Asaas: ${err}`);
        }

        return await response.json();
    },

    async createPayment(
        payment: {
            customer: string;
            billingType: "UNDEFINED" | "BOLETO" | "CREDIT_CARD" | "PIX";
            value: number;
            dueDate: string;
            description?: string;
            externalReference?: string;
        },
        apiKey: string
    ) {
        const res = await fetch(`/asaas/payments`, {
            method: "POST",
            headers: {
                accept: "application/json",
                "content-type": "application/json",
                access_token: apiKey ?? ASAAS_TOKEN,
            },
            body: JSON.stringify(payment),
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(
                err.errors?.[0]?.description || "Erro ao criar cobrança no Asaas"
            );
        }

        return res.json();
    },

    // async deleteSubAccount(id: string) {
    //     const response = await fetch(`/asaas/customers/accounts/${id}`, {
    //         method: "DELETE",
    //         headers: {
    //             access_token: ASAAS_TOKEN!,
    //         },
    //     });

    //     if (!response.ok) {
    //         const err = await response.text();
    //         throw new Error(`Erro ao excluir subconta no Asaas: ${err}`);
    //     }

    //     return true;
    // }

};
