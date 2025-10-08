const API_BASE_URL =
    import.meta.env.MODE === "development"
        ? "/asaas"
        : "/api/asaas";
        
const ASAAS_GENERAL_TOKEN = import.meta.env.VITE_ASAAS_TOKEN;

export const asaasService = {
    async createCustomer(customer: {
        name: string;
        cpfCnpj: string;
        email?: string;
        mobilePhone?: string;
        notificationDisabled?: boolean;
    }, asaasApiKey?: string) {
        const res = await fetch(`${API_BASE_URL}/customers`, {
            method: "POST",
            headers: {
                "accept": "application/json",
                "content-type": "application/json",
                "x-asaas-key": asaasApiKey, 
            },
            body: JSON.stringify(customer),
        });

        if (!res.ok) {
            const errorText = await res.text();
            let errorMessage = `Erro (${res.status}) ao criar cliente no Asaas: ${errorText}`;

            try {
                const err = JSON.parse(errorText);
                errorMessage = err.errors?.[0]?.description || JSON.stringify(err);
            } catch (e) {
                errorMessage = `Falha de Conexão (${res.status} ${res.statusText || 'Erro Desconhecido'}): ${errorText}`;
            }

            throw new Error(errorMessage);
        }

        return res.json();
    },

    async deletePayment(paymentId: string, asaasApiKey: string) {
        const res = await fetch(`${API_BASE_URL}/payments/${paymentId}`, {
            method: "DELETE",
            headers: {
                accept: "application/json",
                "content-type": "application/json",
                "x-asaas-key": asaasApiKey,
            },
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(
                err.errors?.[0]?.description || "Erro ao excluir mensalidade no Asaas"
            );
        }

        return res.json();
    },

    async deleteCustomer(customerId: string, asaasApiKey: string) {
        const res = await fetch(`${API_BASE_URL}/customers/${customerId}`, {
            method: "DELETE",
            headers: {
                accept: "application/json",
                "x-asaas-key": asaasApiKey,
            },
        },);

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.errors?.[0]?.description || "Erro ao excluir cliente no Asaas");
        }

        return res.json();
    },

    async createSubAccount(data: any) {
        const response = await fetch(`${API_BASE_URL}/accounts`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-asaas-key": ASAAS_GENERAL_TOKEN!,
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
        asaasApiKey: string
    ) {
        const res = await fetch(`${API_BASE_URL}/payments`, {
            method: "POST",
            headers: {
                accept: "application/json",
                "content-type": "application/json",
                "x-asaas-key": asaasApiKey,
            },
            body: JSON.stringify(payment),
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(
                err.errors?.[0]?.description || "Erro ao criar mensalidade no Asaas"
            );
        }

        return res.json();
    },

    async createWebhook(subAccountasaasApiKey: string): Promise<any> {
        try {
            const response = await fetch("${API_BASE_URL}/customers/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-asaas-key": subAccountasaasApiKey,
                },
                body: JSON.stringify({
                    name: "Webhook Mensalidade Passageiro Recebida",
                    url: "https://jztyffakurtekwxurclw.supabase.co/functions/v1/pagamentoMensalidadePassageiro",
                    email: null,
                    enabled: true,
                    interrupted: false,
                    apiVersion: 3,
                    sendType: "SEQUENTIALLY",
                    events: ["PAYMENT_RECEIVED"],
                    authToken: import.meta.env.VITE_ASAAS_WEBHOOK_TOKEN,
                }),
            });

            if (!response.ok) {
                throw new Error(`Erro ao criar webhook: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Erro ao criar webhook:", error);
            throw error;
        }
    },

    async updatePayment(paymentId: string, body: any, asaasApiKey: string) {
        try {
            const response = await fetch(`${API_BASE_URL}/payments/${paymentId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "x-asaas-key": asaasApiKey,
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Erro ao atualizar mensalidade: ${JSON.stringify(errorData)}`);
            }

            return await response.json();
        } catch (err) {
            console.error("Erro no updatePayment:", err);
            throw err;
        }
    },

    async confirmPaymentInCash(paymentId: string, paymentDate: string, value: number, asaasApiKey: string) {
        try {
            const payload = {
                paymentDate,
                value,
                notifyCustomer: false,
            };

            const response = await fetch(`${API_BASE_URL}/payments/${paymentId}/receiveInCash`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-asaas-key": asaasApiKey,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Erro ao confirmar pagamento manual: ${JSON.stringify(errorData)}`);
            }

            return await response.json();
        } catch (err) {
            console.error("Erro em confirmPaymentInCash:", err);
            throw err;
        }
    },

    async undoPaymentInCash(paymentId: string, asaasApiKey: string) {
        try {
            const response = await fetch(`${API_BASE_URL}/payments/${paymentId}/undoReceivedInCash`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-asaas-key": asaasApiKey,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Erro ao desfazer pagamento manual: ${JSON.stringify(errorData)}`);
            }

            return await response.json();
        } catch (err) {
            console.error("Erro em undoPaymentInCash:", err);
            throw err;
        }
    },

    async obterPixAsaas(paymentId: string, asaasApiKey: string): Promise<{
        payload: string;
        encodedImage?: string;
        expirationDate?: string;
        description?: string;
    } | null> {
        try {
            const res = await fetch(`${API_BASE_URL}/payments/${paymentId}/pixQrCode`, {
                method: "GET",
                headers: {
                    accept: "application/json",
                    "x-asaas-key": asaasApiKey,
                },
            });
            if (!res.ok) {
                console.error("Asaas pixQrCode HTTP", res.status, await res.text());
                return null;
            }
            const data = await res.json();
            if (!data?.payload) return null;
            return {
                payload: data.payload,
                encodedImage: data.encodedImage,
                expirationDate: data.expirationDate,
                description: data.description,
            };
        } catch (e) {
            console.error("Asaas pixQrCode erro", e);
            return null;
        }
    },

    // async deleteSubAccount(id: string) {
    //     const response = await fetch(`${API_BASE_URL}/customers/accounts/${id}`, {
    //         method: "DELETE",
    //         headers: {
    //             "x-asaas-key": ASAAS_GENERAL_TOKEN!,
    //         },
    //     });

    //     if (!response.ok) {
    //         const err = await response.text();
    //         throw new Error(`Erro ao excluir subconta no Asaas: ${err}`);
    //     }

    //     return true;
    // }

};
