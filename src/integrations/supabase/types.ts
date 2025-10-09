export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      assinaturas_usuarios: {
        Row: {
          asaas_subscription_id: string
          created_at: string
          id: string
          usuario_id: string | null
          status: string
          updated_at: string
          valor: number
          vencimento: string
        }
        Insert: {
          asaas_subscription_id: string
          created_at?: string
          id?: string
          usuario_id?: string | null
          status?: string
          updated_at?: string
          valor?: number
          vencimento: string
        }
        Update: {
          asaas_subscription_id?: string
          created_at?: string
          id?: string
          usuario_id?: string | null
          status?: string
          updated_at?: string
          valor?: number
          vencimento?: string
        }
        Relationships: [
          {
            foreignKeyName: "assinaturas_usuarios_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      cobrancas: {
        Row: {
          ano: number
          asaas_payment_id: string
          created_at: string
          data_pagamento: string | null
          data_vencimento: string
          desativar_lembretes: boolean
          id: string
          mes: number
          usuario_id: string
          pagamento_manual: boolean
          passageiro_id: string
          status: string
          tipo_pagamento: string | null
          updated_at: string
          valor: number
          origem: string
          asaas_invoice_url: string
          asaas_bankslip_url: string
        }
        Insert: {
          ano: number
          asaas_payment_id: string
          created_at?: string
          data_pagamento?: string | null
          data_vencimento: string
          desativar_lembretes?: boolean
          id?: string
          mes: number
          usuario_id: string
          pagamento_manual?: boolean
          passageiro_id: string
          status?: string
          tipo_pagamento?: string | null
          updated_at?: string
          valor: number
          origem: string
          asaas_invoice_url?: string
          asaas_bankslip_url?: string
        }
        Update: {
          ano?: number
          asaas_payment_id?: string
          created_at?: string
          data_pagamento?: string | null
          data_vencimento?: string
          desativar_lembretes?: boolean
          id?: string
          mes?: number
          usuario_id?: string
          pagamento_manual?: boolean
          passageiro_id?: string
          status?: string
          tipo_pagamento?: string | null
          updated_at?: string
          valor?: number
          origem?: string
          asaas_invoice_url?: string
          asaas_bankslip_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "cobrancas_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cobrancas_passageiro_id_fkey"
            columns: ["passageiro_id"]
            isOneToOne: false
            referencedRelation: "passageiros"
            referencedColumns: ["id"]
          },
        ]
      }
      escolas: {
        Row: {
          ativo: boolean
          bairro: string | null
          cep: string | null
          cidade: string | null
          created_at: string
          estado: string | null
          id: string
          nome: string
          numero: string | null
          referencia: string | null
          rua: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          created_at?: string
          estado?: string | null
          id?: string
          nome: string
          numero?: string | null
          referencia?: string | null
          rua?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          created_at?: string
          estado?: string | null
          id?: string
          nome?: string
          numero?: string | null
          referencia?: string | null
          rua?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      configuracoes_motoristas: {
        Row: {
          id: string
          usuario_id: string
          horario_envio: string | null
          mensagem_lembrete_antecipada: string | null
          mensagem_lembrete_dia: string | null
          mensagem_lembrete_atraso: string | null
          dias_antes_vencimento: number | null
          dias_apos_vencimento: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          usuario_id: string
          horario_envio?: string | null
          mensagem_lembrete_antecipada?: string | null
          mensagem_lembrete_dia?: string | null
          mensagem_lembrete_atraso?: string | null
          dias_antes_vencimento?: number | null
          dias_apos_vencimento?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          usuario_id?: string
          horario_envio?: string | null
          mensagem_lembrete_antecipada?: string | null
          mensagem_lembrete_dia?: string | null
          mensagem_lembrete_atraso?: string | null
          dias_antes_vencimento?: number | null
          dias_apos_vencimento?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "configuracoes_motoristas_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: true
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          }
        ]
      }
      passageiros: {
        Row: {
          asaas_customer_id: string
          ativo: boolean
          bairro: string | null
          cep: string | null
          cidade: string | null
          cpf_responsavel: string
          genero: string
          observacoes: string | null
          created_at: string
          dia_vencimento: number
          escola_id: string
          estado: string | null
          id: string
          usuario_id: string
          nome: string
          nome_responsavel: string
          email_responsavel: string
          numero: string | null
          referencia: string | null
          rua: string | null
          telefone_responsavel: string
          updated_at: string
          valor_mensalidade: number
        }
        Insert: {
          asaas_customer_id: string
          cpf_responsavel: string
          dia_vencimento: number
          escola_id: string
          usuario_id: string
          nome: string
          genero: string
          observacoes?: string | null
          nome_responsavel: string
          email_responsavel: string
          telefone_responsavel: string
          valor_mensalidade: number
          ativo?: boolean
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          created_at?: string
          estado?: string | null
          id?: string
          numero?: string | null
          referencia?: string | null
          rua?: string | null
          updated_at?: string
        }
        Update: {
          asaas_customer_id?: string
          ativo?: boolean
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          cpf_responsavel?: string
          genero: string
          observacoes?: string | null
          created_at?: string
          dia_vencimento?: number
          escola_id?: string
          estado?: string | null
          id?: string
          usuario_id?: string
          nome?: string
          nome_responsavel?: string
          email_responsavel?: string
          numero?: string | null
          referencia?: string | null
          rua?: string | null
          telefone_responsavel?: string
          updated_at?: string
          valor_mensalidade?: number
        }
        Relationships: [
          {
            foreignKeyName: "passageiros_escola_id_fkey"
            columns: ["escola_id"]
            isOneToOne: false
            referencedRelation: "escolas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "passageiros_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      usuarios: {
        Row: {
          id: string
          auth_uid: string | null
          nome: string
          cpfcnpj: string
          email: string
          telefone: string;
          asaas_subaccount_id?: string;
          asaas_subaccount_api_key?: string;
          asaas_root_customer_id?: string;
          role: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          auth_uid?: string | null
          nome: string
          cpfcnpj: string
          email: string
          telefone: string;
          asaas_subaccount_id?: string;
          asaas_subaccount_api_key?: string;
          asaas_root_customer_id?: string;
          role: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          auth_uid?: string | null
          nome?: string
          cpfcnpj?: string
          email?: string
          telefone?: string;
          asaas_subaccount_id?: string;
          asaas_subaccount_api_key?: string;
          asaas_root_customer_id?: string;
          role?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usuarios_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      },
      gastos: {
        Row: {
          id: string
          auth_uid: string | null
          usuario_id: string
          descricao: string
          valor: number
          date: string
          categoria: number
          notas: string
        }
        Insert: {
          id: string
          auth_uid: string | null
          usuario_id: string
          descricao: string
          valor: number
          date: string
          categoria: number
          notas: string
        }
        Update: {
          id: string
          auth_uid: string | null
          usuario_id: string
          descricao: string
          valor: number
          date: string
          categoria: number
          notas: string
        }
        Relationships: [
          {
            foreignKeyName: "gastos_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_by_cpf: {
        Args: { cpf_cnpj: string }
        Returns: {
          email: string
          role: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
  | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
  ? R
  : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
    DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
    DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
  ? R
  : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I
  }
  ? I
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Insert: infer I
  }
  ? I
  : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U
  }
  ? U
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Update: infer U
  }
  ? U
  : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
  | keyof DefaultSchema["Enums"]
  | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
  : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
  | keyof DefaultSchema["CompositeTypes"]
  | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
  : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
