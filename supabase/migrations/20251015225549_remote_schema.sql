

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."tipo_pagamento_enum" AS ENUM (
    'dinheiro',
    'cartao-credito',
    'cartao-debito',
    'transferencia',
    'PIX',
    'boleto'
);


ALTER TYPE "public"."tipo_pagamento_enum" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_by_cpf"("cpf_cnpj" "text") RETURNS TABLE("email" "text", "role" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT u.email, u.role
  FROM public.usuarios u
  WHERE u.cpfCnpj = cpf_cnpj;
END;
$$;


ALTER FUNCTION "public"."get_user_by_cpf"("cpf_cnpj" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."asaas_webhook_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "asaas_event_id" "text" NOT NULL,
    "event_type" "text" NOT NULL,
    "payload" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "status" "text" DEFAULT 'PENDING'::"text",
    CONSTRAINT "asaas_webhook_events_status_check" CHECK (("status" = ANY (ARRAY['PENDING'::"text", 'DONE'::"text"])))
);


ALTER TABLE "public"."asaas_webhook_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."assinaturas_usuarios" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "usuario_id" "uuid" NOT NULL,
    "valor" numeric(10,2) DEFAULT NULL::numeric NOT NULL,
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "asaas_subscription_id" "text" NOT NULL,
    "vencimento" "date" NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp without time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."assinaturas_usuarios" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."cobranca_notificacoes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "cobranca_id" "uuid" NOT NULL,
    "tipo_origem" character varying(10) NOT NULL,
    "tipo_evento" character varying(50) NOT NULL,
    "canal" character varying(20) NOT NULL,
    "data_envio" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT "chk_canal" CHECK ((("canal")::"text" = ANY ((ARRAY['whatsapp'::character varying, 'email'::character varying, 'sms'::character varying])::"text"[]))),
    CONSTRAINT "chk_tipo_origem" CHECK ((("tipo_origem")::"text" = ANY ((ARRAY['auto'::character varying, 'manual'::character varying])::"text"[])))
);


ALTER TABLE "public"."cobranca_notificacoes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."cobrancas" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "passageiro_id" "uuid" NOT NULL,
    "mes" integer NOT NULL,
    "ano" integer NOT NULL,
    "valor" numeric(10,2) NOT NULL,
    "status" "text" DEFAULT 'pendente'::"text" NOT NULL,
    "data_vencimento" "date" NOT NULL,
    "data_pagamento" "date",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "pagamento_manual" boolean DEFAULT false NOT NULL,
    "desativar_lembretes" boolean DEFAULT false NOT NULL,
    "asaas_payment_id" "text",
    "usuario_id" "uuid" NOT NULL,
    "origem" "text" DEFAULT '''automatica''::text'::"text" NOT NULL,
    "asaas_invoice_url" "text",
    "asaas_bankslip_url" "text",
    "tipo_pagamento" "public"."tipo_pagamento_enum",
    CONSTRAINT "cobrancas_mes_check" CHECK ((("mes" >= 1) AND ("mes" <= 12))),
    CONSTRAINT "cobrancas_origem_check" CHECK (("origem" = ANY (ARRAY['automatica'::"text", 'manual'::"text"]))),
    CONSTRAINT "cobrancas_status_check" CHECK (("status" = ANY (ARRAY['pendente'::"text", 'pago'::"text", 'atrasado'::"text"])))
);


ALTER TABLE "public"."cobrancas" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."configuracoes_admin" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "mensagem_padrao_dia" "text",
    "mensagem_padrao_antecipada" "text",
    "mensagem_padrao_atraso" "text",
    "trial_dias" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."configuracoes_admin" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."configuracoes_motoristas" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "usuario_id" "uuid" NOT NULL,
    "horario_envio" time without time zone,
    "mensagem_lembrete_dia" "text" DEFAULT ''::"text",
    "dias_antes_vencimento" integer DEFAULT 0,
    "dias_apos_vencimento" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "mensagem_lembrete_antecipada" "text",
    "mensagem_lembrete_atraso" "text"
);


ALTER TABLE "public"."configuracoes_motoristas" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."escolas" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "nome" "text" NOT NULL,
    "logradouro" "text",
    "numero" "text",
    "bairro" "text",
    "cidade" "text",
    "estado" "text",
    "cep" "text",
    "referencia" "text",
    "ativo" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "usuario_id" "uuid" NOT NULL
);


ALTER TABLE "public"."escolas" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."gastos" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "usuario_id" "uuid",
    "valor" numeric(10,2) NOT NULL,
    "data" "date" NOT NULL,
    "categoria" "text" NOT NULL,
    "descricao" "text"
);


ALTER TABLE "public"."gastos" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."passageiros" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "nome" "text" NOT NULL,
    "nome_responsavel" "text" NOT NULL,
    "telefone_responsavel" "text" NOT NULL,
    "valor_cobranca" numeric(10,2) NOT NULL,
    "dia_vencimento" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "logradouro" "text" NOT NULL,
    "numero" "text" NOT NULL,
    "bairro" "text" NOT NULL,
    "cidade" "text" NOT NULL,
    "estado" "text" NOT NULL,
    "cep" "text" NOT NULL,
    "referencia" "text",
    "escola_id" "uuid" NOT NULL,
    "ativo" boolean DEFAULT true NOT NULL,
    "cpf_responsavel" "text" NOT NULL,
    "asaas_customer_id" "text" NOT NULL,
    "usuario_id" "uuid" NOT NULL,
    "email_responsavel" "text" NOT NULL,
    "genero" "text" NOT NULL,
    "observacoes" "text",
    CONSTRAINT "alunos_dia_vencimento_check" CHECK ((("dia_vencimento" >= 1) AND ("dia_vencimento" <= 31)))
);


ALTER TABLE "public"."passageiros" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."pre_passageiros" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "usuario_id" "uuid" NOT NULL,
    "nome" "text" NOT NULL,
    "nome_responsavel" "text" NOT NULL,
    "email_responsavel" "text" NOT NULL,
    "cpf_responsavel" "text" NOT NULL,
    "telefone_responsavel" "text" NOT NULL,
    "genero" "text" NOT NULL,
    "logradouro" "text",
    "numero" "text",
    "bairro" "text",
    "cidade" "text",
    "estado" "text",
    "cep" "text",
    "referencia" "text",
    "observacoes" "text",
    "escola_id" "uuid",
    "valor_cobranca" numeric,
    "dia_vencimento" integer,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."pre_passageiros" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."usuarios" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "cpfcnpj" "text" NOT NULL,
    "email" "text" NOT NULL,
    "role" "text" NOT NULL,
    "auth_uid" "uuid",
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "telefone" "text" NOT NULL,
    "asaas_subaccount_id" "text",
    "asaas_root_customer_id" "text",
    "nome" "text" NOT NULL,
    "updated_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "asaas_subaccount_api_key" "text",
    CONSTRAINT "usuarios_role_check" CHECK (("role" = ANY (ARRAY['admin'::"text", 'motorista'::"text"])))
);


ALTER TABLE "public"."usuarios" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."vw_cobrancas_detalhes" AS
 SELECT "c"."id",
    "c"."valor",
    "c"."data_vencimento",
    "c"."data_pagamento",
    "c"."tipo_pagamento",
    "c"."status",
    "c"."desativar_lembretes",
    "c"."asaas_bankslip_url",
    "c"."asaas_invoice_url",
    "c"."asaas_payment_id",
    "c"."origem",
    "c"."pagamento_manual",
    "c"."passageiro_id",
    "c"."mes",
    "c"."ano",
    "p"."nome" AS "passageiro_nome",
    "p"."nome_responsavel",
    "p"."telefone_responsavel",
    "p"."cpf_responsavel",
    "e"."id" AS "escola_id",
    "e"."nome" AS "escola_nome"
   FROM (("public"."cobrancas" "c"
     JOIN "public"."passageiros" "p" ON (("p"."id" = "c"."passageiro_id")))
     JOIN "public"."escolas" "e" ON (("e"."id" = "p"."escola_id")));


ALTER VIEW "public"."vw_cobrancas_detalhes" OWNER TO "postgres";


ALTER TABLE ONLY "public"."passageiros"
    ADD CONSTRAINT "alunos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."asaas_webhook_events"
    ADD CONSTRAINT "asaas_webhook_events_asaas_event_id_key" UNIQUE ("asaas_event_id");



ALTER TABLE ONLY "public"."asaas_webhook_events"
    ADD CONSTRAINT "asaas_webhook_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."assinaturas_usuarios"
    ADD CONSTRAINT "assinaturas_motoristas_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cobranca_notificacoes"
    ADD CONSTRAINT "cobranca_notificacoes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cobrancas"
    ADD CONSTRAINT "cobrancas_aluno_id_mes_ano_key" UNIQUE ("passageiro_id", "mes", "ano");



ALTER TABLE ONLY "public"."cobrancas"
    ADD CONSTRAINT "cobrancas_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."configuracoes_admin"
    ADD CONSTRAINT "configuracoes_admin_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."configuracoes_motoristas"
    ADD CONSTRAINT "configuracoes_motoristas_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."escolas"
    ADD CONSTRAINT "escolas_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."gastos"
    ADD CONSTRAINT "gastos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pre_passageiros"
    ADD CONSTRAINT "pre_passageiros_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."usuarios"
    ADD CONSTRAINT "usuarios_auth_uid_key" UNIQUE ("auth_uid");



ALTER TABLE ONLY "public"."usuarios"
    ADD CONSTRAINT "usuarios_cpfcnpj_key" UNIQUE ("cpfcnpj");



ALTER TABLE ONLY "public"."usuarios"
    ADD CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_usuarios_role" ON "public"."usuarios" USING "btree" ("role");



CREATE OR REPLACE TRIGGER "update_alunos_updated_at" BEFORE UPDATE ON "public"."passageiros" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_cobrancas_updated_at" BEFORE UPDATE ON "public"."cobrancas" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_escolas_updated_at" BEFORE UPDATE ON "public"."escolas" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."assinaturas_usuarios"
    ADD CONSTRAINT "assinaturas_usuarios_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON UPDATE CASCADE ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."cobranca_notificacoes"
    ADD CONSTRAINT "cobranca_notificacoes_cobranca_id_fkey" FOREIGN KEY ("cobranca_id") REFERENCES "public"."cobrancas"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."cobrancas"
    ADD CONSTRAINT "cobrancas_passageiro_id_fkey" FOREIGN KEY ("passageiro_id") REFERENCES "public"."passageiros"("id") ON UPDATE CASCADE ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."cobrancas"
    ADD CONSTRAINT "cobrancas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON UPDATE CASCADE ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."configuracoes_motoristas"
    ADD CONSTRAINT "configuracoes_motoristas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."escolas"
    ADD CONSTRAINT "escolas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON UPDATE CASCADE ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."pre_passageiros"
    ADD CONSTRAINT "fk_motorista" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id");



ALTER TABLE ONLY "public"."gastos"
    ADD CONSTRAINT "gastos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."passageiros"
    ADD CONSTRAINT "passageiros_escola_id_fkey" FOREIGN KEY ("escola_id") REFERENCES "public"."escolas"("id");



ALTER TABLE ONLY "public"."passageiros"
    ADD CONSTRAINT "passageiros_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON UPDATE CASCADE ON DELETE RESTRICT;





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."get_user_by_cpf"("cpf_cnpj" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_by_cpf"("cpf_cnpj" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_by_cpf"("cpf_cnpj" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";


















GRANT ALL ON TABLE "public"."asaas_webhook_events" TO "anon";
GRANT ALL ON TABLE "public"."asaas_webhook_events" TO "authenticated";
GRANT ALL ON TABLE "public"."asaas_webhook_events" TO "service_role";



GRANT ALL ON TABLE "public"."assinaturas_usuarios" TO "anon";
GRANT ALL ON TABLE "public"."assinaturas_usuarios" TO "authenticated";
GRANT ALL ON TABLE "public"."assinaturas_usuarios" TO "service_role";



GRANT ALL ON TABLE "public"."cobranca_notificacoes" TO "anon";
GRANT ALL ON TABLE "public"."cobranca_notificacoes" TO "authenticated";
GRANT ALL ON TABLE "public"."cobranca_notificacoes" TO "service_role";



GRANT ALL ON TABLE "public"."cobrancas" TO "anon";
GRANT ALL ON TABLE "public"."cobrancas" TO "authenticated";
GRANT ALL ON TABLE "public"."cobrancas" TO "service_role";



GRANT ALL ON TABLE "public"."configuracoes_admin" TO "anon";
GRANT ALL ON TABLE "public"."configuracoes_admin" TO "authenticated";
GRANT ALL ON TABLE "public"."configuracoes_admin" TO "service_role";



GRANT ALL ON TABLE "public"."configuracoes_motoristas" TO "anon";
GRANT ALL ON TABLE "public"."configuracoes_motoristas" TO "authenticated";
GRANT ALL ON TABLE "public"."configuracoes_motoristas" TO "service_role";



GRANT ALL ON TABLE "public"."escolas" TO "anon";
GRANT ALL ON TABLE "public"."escolas" TO "authenticated";
GRANT ALL ON TABLE "public"."escolas" TO "service_role";



GRANT ALL ON TABLE "public"."gastos" TO "anon";
GRANT ALL ON TABLE "public"."gastos" TO "authenticated";
GRANT ALL ON TABLE "public"."gastos" TO "service_role";



GRANT ALL ON TABLE "public"."passageiros" TO "anon";
GRANT ALL ON TABLE "public"."passageiros" TO "authenticated";
GRANT ALL ON TABLE "public"."passageiros" TO "service_role";



GRANT ALL ON TABLE "public"."pre_passageiros" TO "anon";
GRANT ALL ON TABLE "public"."pre_passageiros" TO "authenticated";
GRANT ALL ON TABLE "public"."pre_passageiros" TO "service_role";



GRANT ALL ON TABLE "public"."usuarios" TO "anon";
GRANT ALL ON TABLE "public"."usuarios" TO "authenticated";
GRANT ALL ON TABLE "public"."usuarios" TO "service_role";



GRANT ALL ON TABLE "public"."vw_cobrancas_detalhes" TO "anon";
GRANT ALL ON TABLE "public"."vw_cobrancas_detalhes" TO "authenticated";
GRANT ALL ON TABLE "public"."vw_cobrancas_detalhes" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






























RESET ALL;

