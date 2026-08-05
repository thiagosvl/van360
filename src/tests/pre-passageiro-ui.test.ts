import { describe, it, expect } from "vitest";
import { prePassageiroSchema } from "@/schemas/prePassageiroSchema";

describe("Suíte de Testes de Pré-Cadastro de Aluno/Passageiro (pre-passageiro-ui)", () => {
  const validFormData = {
    nome: "Lucas Gabriel Silva",
    nome_responsavel: "Ana Claudia Silva",
    cpf_responsavel: "529.982.247-25",
    telefone_responsavel: "(11) 99999-8888",
    logradouro: "Av. Paulista",
    numero: "1000",
    bairro: "Bela Vista",
    cidade: "São Paulo",
    estado: "SP",
    cep: "01310-100",
    turma: "3º Ano B",
    periodo: "TARDE",
    modalidade: "AMBOS",
    data_nascimento: "10/08/2016",
    genero: "MASCULINO",
    parentesco_responsavel: "MAE",
    data_inicio_transporte: "01/02/2026",
    data_fim_transporte: "15/12/2026",
    valor_cobranca: "R$ 450,00",
    dia_vencimento: "10",
  };

  describe("1. Validação de Dados Válidos", () => {
    it("Deve aprovar com sucesso um formulário de pré-cadastro totalmente preenchido e válido", () => {
      const result = prePassageiroSchema.safeParse(validFormData);
      expect(result.success).toBe(true);
    });

    it("Deve permitir campos opcionais vazios ou não definidos (como observacoes, complemento, etc)", () => {
      const dataWithOptionals = {
        ...validFormData,
        referencia: "Perto do metrô Trianon-Masp",
        complemento: "Apto 42",
        observacoes: "Aluno usa óculos",
        escola_id: "escola-uuid-123",
      };

      const result = prePassageiroSchema.safeParse(dataWithOptionals);
      expect(result.success).toBe(true);
    });
  });

  describe("2. Validação de Campos Obrigatórios de Cadastro", () => {
    it("Deve rejeitar se o nome do aluno tiver menos de 2 caracteres ou estiver ausente", () => {
      const resultEmpty = prePassageiroSchema.safeParse({ ...validFormData, nome: "" });
      expect(resultEmpty.success).toBe(false);

      const resultShort = prePassageiroSchema.safeParse({ ...validFormData, nome: "A" });
      expect(resultShort.success).toBe(false);
    });

    it("Deve rejeitar se o nome do responsável estiver ausente", () => {
      const result = prePassageiroSchema.safeParse({ ...validFormData, nome_responsavel: "" });
      expect(result.success).toBe(false);
    });

    it("Deve exigir o preenchimento de endereço completo (logradouro, número, bairro, cidade, estado)", () => {
      expect(prePassageiroSchema.safeParse({ ...validFormData, logradouro: "" }).success).toBe(false);
      expect(prePassageiroSchema.safeParse({ ...validFormData, numero: "" }).success).toBe(false);
      expect(prePassageiroSchema.safeParse({ ...validFormData, bairro: "" }).success).toBe(false);
      expect(prePassageiroSchema.safeParse({ ...validFormData, cidade: "" }).success).toBe(false);
      expect(prePassageiroSchema.safeParse({ ...validFormData, estado: "" }).success).toBe(false);
    });

    it("Deve exigir informações escolares e operacionais (turma, período, modalidade, parentesco, gênero)", () => {
      expect(prePassageiroSchema.safeParse({ ...validFormData, turma: "" }).success).toBe(false);
      expect(prePassageiroSchema.safeParse({ ...validFormData, periodo: "" }).success).toBe(false);
      expect(prePassageiroSchema.safeParse({ ...validFormData, modalidade: "" }).success).toBe(false);
      expect(prePassageiroSchema.safeParse({ ...validFormData, parentesco_responsavel: "" }).success).toBe(false);
      expect(prePassageiroSchema.safeParse({ ...validFormData, genero: "" }).success).toBe(false);
    });
  });

  describe("3. Validação de Máscaras e Formatos (CPF, Telefone, CEP, Data de Nascimento)", () => {
    it("Deve rejeitar CPF inválido do responsável", () => {
      const resultInvalidCpf = prePassageiroSchema.safeParse({
        ...validFormData,
        cpf_responsavel: "111.111.111-11",
      });
      expect(resultInvalidCpf.success).toBe(false);

      const resultShortCpf = prePassageiroSchema.safeParse({
        ...validFormData,
        cpf_responsavel: "123.456",
      });
      expect(resultShortCpf.success).toBe(false);
    });

    it("Deve rejeitar número de telefone do responsável fora do padrão (15 caracteres com máscara)", () => {
      const result = prePassageiroSchema.safeParse({
        ...validFormData,
        telefone_responsavel: "11999998888",
      });
      expect(result.success).toBe(false);
    });

    it("Deve rejeitar CEP fora do formato 00000-000", () => {
      const result = prePassageiroSchema.safeParse({
        ...validFormData,
        cep: "01310100",
      });
      expect(result.success).toBe(false);
    });

    it("Deve rejeitar data de nascimento inválida ou em formato inadequado", () => {
      const resultInvalidDate = prePassageiroSchema.safeParse({
        ...validFormData,
        data_nascimento: "32/13/2016",
      });
      expect(resultInvalidDate.success).toBe(false);
    });
  });

  describe("4. Validação de Regras de Negócio Financeiras e Datas de Transporte", () => {
    it("Deve aceitar valor de cobrança válido maior ou igual a R$ 1,00", () => {
      const result = prePassageiroSchema.safeParse({
        ...validFormData,
        valor_cobranca: "R$ 1,00",
      });
      expect(result.success).toBe(true);
    });

    it("Deve rejeitar valor de cobrança menor que R$ 1,00 quando fornecido", () => {
      const result = prePassageiroSchema.safeParse({
        ...validFormData,
        valor_cobranca: "R$ 0,50",
      });
      expect(result.success).toBe(false);
    });

    it("Deve permitir valor de cobrança não preenchido ou vazio", () => {
      const result = prePassageiroSchema.safeParse({
        ...validFormData,
        valor_cobranca: "",
      });
      expect(result.success).toBe(true);
    });

    it("Deve rejeitar quando a data de término do transporte for anterior ou igual à data de início", () => {
      const resultInvalidPeriod = prePassageiroSchema.safeParse({
        ...validFormData,
        data_inicio_transporte: "15/12/2026",
        data_fim_transporte: "01/02/2026",
      });
      expect(resultInvalidPeriod.success).toBe(false);
    });

    it("Deve aceitar quando a data de término for posterior à data de início", () => {
      const resultValidPeriod = prePassageiroSchema.safeParse({
        ...validFormData,
        data_inicio_transporte: "01/02/2026",
        data_fim_transporte: "15/12/2026",
      });
      expect(resultValidPeriod.success).toBe(true);
    });
  });
});
