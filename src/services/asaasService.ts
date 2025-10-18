import { supabase } from "@/integrations/supabase/client";

const SUPABASE_BASE_URL = import.meta.env.VITE_SUPABASE_URL;
const API_BASE_URL = `${SUPABASE_BASE_URL}/functions/v1/asaas-proxy`;
const GENERAL_API_BASE_URL = `${SUPABASE_BASE_URL}/functions/v1/asaas-general-proxy`;

export const asaasService = {
    async createCustomer(customer: {
        name: string;
        cpfCnpj: string;
        email?: string;
        mobilePhone?: string;
        notificationDisabled?: boolean;
    }) {
        const authHeaders = await this.getAuthHeaders();

        const res = await fetch(`${API_BASE_URL}/customers`, {
            method: "POST",
            headers: authHeaders,
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

    async updateCustomer(customerId: string, customer: {
        name: string;
        cpfCnpj: string;
        mobilePhone?: string;
        email?: string;
    }) {
        const authHeaders = await this.getAuthHeaders();

        const payload = {
            name: customer.name,
            cpfCnpj: customer.cpfCnpj,
            mobilePhone: customer.mobilePhone,
            email: customer.email,
        };

        const res = await fetch(`${API_BASE_URL}/customers/${customerId}`, {
            method: "PUT",
            headers: authHeaders,
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            const errorText = await res.text();
            let errorMessage = `Erro (${res.status}) ao atualizar cliente no Asaas: ${errorText}`;

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

    async createCustomerGeneral(customer: {
        name: string;
        cpfCnpj: string;
        email?: string;
        mobilePhone?: string;
        notificationDisabled?: boolean;
    }) {
        const res = await fetch(`${GENERAL_API_BASE_URL}/customers`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
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

    async deletePayment(paymentId: string) {
        const authHeaders = await this.getAuthHeaders();

        const res = await fetch(`${API_BASE_URL}/payments/${paymentId}`, {
            method: "DELETE",
            headers: authHeaders,
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(
                err.errors?.[0]?.description || "Erro ao excluir cobrança no Asaas"
            );
        }

        return res.json();
    },

    async deleteCustomer(customerId: string) {
        const authHeaders = await this.getAuthHeaders();

        const res = await fetch(`${API_BASE_URL}/customers/${customerId}`, {
            method: "DELETE",
            headers: authHeaders,
        },);

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.errors?.[0]?.description || "Erro ao excluir cliente no Asaas");
        }

        return res.json();
    },

    async deleteCustomerGeneral(customerId: string) {
        const res = await fetch(`${GENERAL_API_BASE_URL}/customers/${customerId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        },);

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.errors?.[0]?.description || "Erro ao excluir cliente no Asaas");
        }

        return res.json();
    },

    async createPayment(
        payment: {
            customer: string;
            billingType: "UNDEFINED" | "BOLETO" | "CREDIT_CARD" | "PIX";
            value: number;
            dueDate: string;
            description?: string;
            externalReference?: string;
        }
    ) {
        const authHeaders = await this.getAuthHeaders();

        const res = await fetch(`${API_BASE_URL}/payments`, {
            method: "POST",
            headers: authHeaders,
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

    async updatePayment(paymentId: string, body: any) {
        const authHeaders = await this.getAuthHeaders();

        try {
            const response = await fetch(`${API_BASE_URL}/payments/${paymentId}`, {
                method: "PUT",
                headers: authHeaders,
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Erro ao atualizar cobrança: ${JSON.stringify(errorData)}`);
            }

            return await response.json();
        } catch (err) {
            console.error("Erro no updatePayment:", err);
            throw err;
        }
    },

    async confirmPaymentInCash(paymentId: string, paymentDate: string, value: number) {
        const authHeaders = await this.getAuthHeaders();

        try {
            const payload = {
                paymentDate,
                value,
                notifyCustomer: false,
            };

            const response = await fetch(`${API_BASE_URL}/payments/${paymentId}/receiveInCash`, {
                method: "POST",
                headers: authHeaders,
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

    async undoPaymentInCash(paymentId: string) {
        const authHeaders = await this.getAuthHeaders();

        try {
            const response = await fetch(`${API_BASE_URL}/payments/${paymentId}/undoReceivedInCash`, {
                method: "POST",
                headers: authHeaders,
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

    async getPixAsaas(paymentId: string): Promise<{
        payload: string;
        encodedImage?: string;
        expirationDate?: string;
        description?: string;
    } | null> {
        const authHeaders = await this.getAuthHeaders();

        try {
            const res = await fetch(`${API_BASE_URL}/payments/${paymentId}/pixQrCode`, {
                method: "GET",
                headers: authHeaders,
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

    async createSubAccount(data: any) {
        const response = await fetch(`${GENERAL_API_BASE_URL}/accounts`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Erro ao criar subconta no Asaas: ${err}`);
        }

        return await response.json();
    },

    async createWebhook(): Promise<any> {
        const authHeaders = await this.getAuthHeaders();

        try {
            const response = await fetch(`${API_BASE_URL}/webhooks/`, {
                method: "POST",
                headers: authHeaders,
                body: JSON.stringify({
                    name: "Webhook Cobrança Passageiro Recebida",
                    url: `${SUPABASE_BASE_URL}/functions/v1/pagamentoMensalidadePassageiro`,
                    email: null,
                    enabled: true,
                    interrupted: false,
                    apiVersion: 3,
                    sendType: "SEQUENTIALLY",
                    events: ["PAYMENT_RECEIVED"],
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

    async getAuthHeaders() {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error || !session) {
            throw new Error("Sessão de usuário não encontrada. Por favor, faça login novamente.");
        }

        const token = session.access_token;

        return {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
            "accept": "application/json",
        };
    },

    async provisionAsaasMotorista(usuarioDataDB: any, subAccountPayload: any): Promise<any> {
        const PROVISION_API_URL = `${SUPABASE_BASE_URL}/functions/v1/asaasProvisioning`;

        const response = await fetch(PROVISION_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'accept': 'application/json',
            },
            body: JSON.stringify({
                usuarioDataDB,
                subAccountPayload
            })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || "Falha ao provisionar recursos Asaas.");
        }
        return response.json();
    }

};
