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
      assinaturas_motoristas: {
        Row: {
          asaas_subscription_id: string
          created_at: string
          id: string
          motorista_id: string | null
          status: string
          updated_at: string
          valor: number
          vencimento: string
        }
        Insert: {
          asaas_subscription_id: string
          created_at?: string
          id?: string
          motorista_id?: string | null
          status?: string
          updated_at?: string
          valor?: number
          vencimento: string
        }
        Update: {
          asaas_subscription_id?: string
          created_at?: string
          id?: string
          motorista_id?: string | null
          status?: string
          updated_at?: string
          valor?: number
          vencimento?: string
        }
        Relationships: [
          {
            foreignKeyName: "assinaturas_motoristas_motorista_id_fkey"
            columns: ["motorista_id"]
            isOneToOne: false
            referencedRelation: "motoristas"
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
          enviado_em: string | null
          id: string
          mes: number
          motorista_id: string
          pagamento_manual: boolean
          passageiro_id: string
          status: string
          tipo_pagamento: string | null
          updated_at: string
          valor: number
        }
        Insert: {
          ano: number
          asaas_payment_id: string
          created_at?: string
          data_pagamento?: string | null
          data_vencimento: string
          desativar_lembretes?: boolean
          enviado_em?: string | null
          id?: string
          mes: number
          motorista_id: string
          pagamento_manual?: boolean
          passageiro_id: string
          status?: string
          tipo_pagamento?: string | null
          updated_at?: string
          valor: number
        }
        Update: {
          ano?: number
          asaas_payment_id?: string
          created_at?: string
          data_pagamento?: string | null
          data_vencimento?: string
          desativar_lembretes?: boolean
          enviado_em?: string | null
          id?: string
          mes?: number
          motorista_id?: string
          pagamento_manual?: boolean
          passageiro_id?: string
          status?: string
          tipo_pagamento?: string | null
          updated_at?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "cobrancas_motorista_id_fkey"
            columns: ["motorista_id"]
            isOneToOne: false
            referencedRelation: "motoristas"
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
      motoristas: {
        Row: {
          asaas_root_customer_id: string | null
          asaas_subaccount_api_key: string | null
          asaas_subaccount_id: string | null
          auth_uid: string | null
          cpfCnpj: string
          created_at: string | null
          email: string
          id: string
          nome: string
          telefone: string | null
          updated_at: string | null
        }
        Insert: {
          asaas_root_customer_id?: string | null
          asaas_subaccount_api_key?: string | null
          asaas_subaccount_id?: string | null
          auth_uid?: string | null
          cpfCnpj: string
          created_at?: string | null
          email: string
          id?: string
          nome: string
          telefone?: string | null
          updated_at?: string | null
        }
        Update: {
          asaas_root_customer_id?: string | null
          asaas_subaccount_api_key?: string | null
          asaas_subaccount_id?: string | null
          auth_uid?: string | null
          cpfCnpj?: string
          created_at?: string | null
          email?: string
          id?: string
          nome?: string
          telefone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      passageiros: {
        Row: {
          asaas_customer_id: string
          ativo: boolean
          bairro: string | null
          cep: string | null
          cidade: string | null
          cpf_responsavel: string
          created_at: string
          dia_vencimento: number
          escola_id: string
          estado: string | null
          id: string
          motorista_id: string
          nome: string
          nome_responsavel: string
          numero: string | null
          referencia: string | null
          rua: string | null
          telefone_responsavel: string
          updated_at: string
          valor_mensalidade: number
        }
        Insert: {
          asaas_customer_id: string
          ativo?: boolean
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          cpf_responsavel: string
          created_at?: string
          dia_vencimento: number
          escola_id: string
          estado?: string | null
          id?: string
          motorista_id: string
          nome: string
          nome_responsavel: string
          numero?: string | null
          referencia?: string | null
          rua?: string | null
          telefone_responsavel: string
          updated_at?: string
          valor_mensalidade: number
        }
        Update: {
          asaas_customer_id?: string
          ativo?: boolean
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          cpf_responsavel?: string
          created_at?: string
          dia_vencimento?: number
          escola_id?: string
          estado?: string | null
          id?: string
          motorista_id?: string
          nome?: string
          nome_responsavel?: string
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
            foreignKeyName: "passageiros_motorista_id_fkey"
            columns: ["motorista_id"]
            isOneToOne: false
            referencedRelation: "motoristas"
            referencedColumns: ["id"]
          },
        ]
      }
      usuarios: {
        Row: {
          auth_uid: string | null
          cpfcnpj: string
          created_at: string | null
          email: string
          id: string
          motorista_id: string | null
          role: string
        }
        Insert: {
          auth_uid?: string | null
          cpfcnpj: string
          created_at?: string | null
          email: string
          id?: string
          motorista_id?: string | null
          role: string
        }
        Update: {
          auth_uid?: string | null
          cpfcnpj?: string
          created_at?: string | null
          email?: string
          id?: string
          motorista_id?: string | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "usuarios_motorista_id_fkey"
            columns: ["motorista_id"]
            isOneToOne: false
            referencedRelation: "motoristas"
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
