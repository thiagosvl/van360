import { describe, it, expect, vi } from "vitest";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
  },
}));

import { veiculoSchema } from "@/hooks/form/useVeiculoForm";
import { escolaSchema } from "@/hooks/form/useEscolaForm";
import { cobrancaSchema } from "@/hooks/form/useCobrancaForm";
import {
  aplicarMascaraPlaca,
  formatarPlacaExibicao,
  validarPlaca,
  limparPlaca,
} from "@/utils/domain/veiculo/placaUtils";
import {
  formatarNomeTurno,
  agruparAlunosPorTurno,
  calcularResumoAlunosPorTurno,
  AlunoComPeriodo,
} from "@/utils/escolaUtils";
import { PassageiroPeriodo } from "@/types/enums";
import { addDays } from "@/utils/dateUtils";

describe("Suíte de Testes: Formulários Zod e Utilitários de Veículos, Escolas e Cobranças", () => {
  describe("1. Validadores Zod dos Hooks de Formulário", () => {
    describe("useVeiculoForm - veiculoSchema", () => {
      it("Deve aceitar placas válidas nos padrões Mercosul e Antigo", () => {
        const veiculoAntigo = {
          placa: "ABC-1234",
          marca: "Mercedes-Benz",
          modelo: "Sprinter",
          ativo: true,
        };
        const resAntigo = veiculoSchema.safeParse(veiculoAntigo);
        expect(resAntigo.success).toBe(true);

        const veiculoMercosul = {
          placa: "BRA2E19",
          marca: "Fiat",
          modelo: "Ducato",
        };
        const resMercosul = veiculoSchema.safeParse(veiculoMercosul);
        expect(resMercosul.success).toBe(true);
      });

      it("Deve rejeitar placas inválidas", () => {
        const veiculoInvalido = {
          placa: "1234567",
          marca: "Renault",
          modelo: "Master",
        };
        const res = veiculoSchema.safeParse(veiculoInvalido);
        expect(res.success).toBe(false);
        if (!res.success) {
          expect(res.error.issues[0].message).toBe("Placa inválida");
        }
      });

      it("Deve exigir marca e modelo", () => {
        const veiculoSemMarca = {
          placa: "ABC1D23",
          marca: "",
          modelo: "Ducato",
        };
        expect(veiculoSchema.safeParse(veiculoSemMarca).success).toBe(false);

        const veiculoSemModelo = {
          placa: "ABC1D23",
          marca: "Fiat",
          modelo: "",
        };
        expect(veiculoSchema.safeParse(veiculoSemModelo).success).toBe(false);
      });
    });

    describe("useEscolaForm - escolaSchema", () => {
      it("Deve validar nome da escola obrigatório", () => {
        const escolaValida = {
          nome: "Escola Estadual Monteiro Lobato",
        };
        expect(escolaSchema.safeParse(escolaValida).success).toBe(true);

        const escolaInvalida = {
          nome: "",
        };
        const res = escolaSchema.safeParse(escolaInvalida);
        expect(res.success).toBe(false);
      });

      it("Deve validar endereço e CEP opcional quando fornecidos", () => {
        const escolaComEnderecoValido = {
          nome: "Colégio Dom Bosco",
          logradouro: "Rua das Flores",
          numero: "123",
          cep: "01001-000",
        };
        expect(escolaSchema.safeParse(escolaComEnderecoValido).success).toBe(true);

        const escolaComCepInvalido = {
          nome: "Colégio Dom Bosco",
          logradouro: "Rua das Flores",
          numero: "123",
          cep: "123",
        };
        expect(escolaSchema.safeParse(escolaComCepInvalido).success).toBe(false);
      });
    });

    describe("useCobrancaForm - cobrancaSchema", () => {
      it("Deve exigir valor mínimo de R$ 1,00 para cobrança", () => {
        const cobrancaValida = {
          valor: "R$ 150,00",
          data_vencimento: new Date(),
          foi_pago: false,
        };
        expect(cobrancaSchema.safeParse(cobrancaValida).success).toBe(true);

        const cobrancaValorBaixo = {
          valor: "R$ 0,50",
          data_vencimento: new Date(),
          foi_pago: false,
        };
        expect(cobrancaSchema.safeParse(cobrancaValorBaixo).success).toBe(false);
      });

      it("Deve exigir data_pagamento e tipo_pagamento quando foi_pago for verdadeiro", () => {
        const pagoSemDetalhes = {
          valor: "R$ 200,00",
          data_vencimento: new Date(),
          foi_pago: true,
        };
        expect(cobrancaSchema.safeParse(pagoSemDetalhes).success).toBe(false);

        const pagoCompleto = {
          valor: "R$ 200,00",
          data_vencimento: new Date(),
          foi_pago: true,
          data_pagamento: new Date(),
          tipo_pagamento: "PIX",
        };
        expect(cobrancaSchema.safeParse(pagoCompleto).success).toBe(true);
      });

      it("Deve rejeitar data de pagamento futura", () => {
        const dataFutura = addDays(new Date(), 5);
        const pagoFuturo = {
          valor: "R$ 200,00",
          data_vencimento: new Date(),
          foi_pago: true,
          data_pagamento: dataFutura,
          tipo_pagamento: "PIX",
        };
        const res = cobrancaSchema.safeParse(pagoFuturo);
        expect(res.success).toBe(false);
      });

      it("Deve exigir foi_pago como verdadeiro se is_future for marcado", () => {
        const mesFuturoPendente = {
          valor: "R$ 300,00",
          data_vencimento: new Date(),
          foi_pago: false,
          is_future: true,
        };
        expect(cobrancaSchema.safeParse(mesFuturoPendente).success).toBe(false);
      });
    });
  });

  describe("2. Utilitários de Veículo (placaUtils.ts)", () => {
    it("Deve formatar placas para exibição corretamente", () => {
      expect(formatarPlacaExibicao("ABC1234")).toBe("ABC-1234");
      expect(formatarPlacaExibicao("abc1234")).toBe("ABC-1234");
      expect(formatarPlacaExibicao("BRA2E19")).toBe("BRA2E19");
      expect(formatarPlacaExibicao("")).toBe("");
    });

    it("Deve aplicar máscara de digitação de placa", () => {
      expect(aplicarMascaraPlaca("ABC1234")).toBe("ABC-1234");
      expect(aplicarMascaraPlaca("BRA2E19")).toBe("BRA2E19");
      expect(aplicarMascaraPlaca("ABC")).toBe("ABC");
    });

    it("Deve limpar e validar placas", () => {
      expect(limparPlaca("abc-1234")).toBe("ABC1234");
      expect(validarPlaca("ABC-1234")).toBe(true);
      expect(validarPlaca("BRA2E19")).toBe(true);
      expect(validarPlaca("INVALID")).toBe(false);
    });

  });

  describe("3. Utilitários de Escola (escolaUtils.ts)", () => {
    it("Deve formatar o nome do turno escolar", () => {
      expect(formatarNomeTurno("manha")).toBe("Manhã");
      expect(formatarNomeTurno(PassageiroPeriodo.MANHA)).toBe("Manhã");
      expect(formatarNomeTurno("TARDE")).toBe("Tarde");
      expect(formatarNomeTurno("noite")).toBe("Noite");
      expect(formatarNomeTurno("integral")).toBe("Integral");
      expect(formatarNomeTurno(null)).toBe("Outros");
      expect(formatarNomeTurno("desconhecido")).toBe("Outros");
    });

    it("Deve agrupar alunos por turno escolar", () => {
      const alunos: AlunoComPeriodo[] = [
        { id: "1", nome: "Lucas", periodo: "manha" },
        { id: "2", nome: "Mariana", periodo: "MANHA" },
        { id: "3", nome: "Pedro", periodo: "tarde" },
        { id: "4", nome: "Beatriz", periodo: "integral" },
        { id: "5", nome: "Gabriel", periodo: null },
      ];

      const agrupados = agruparAlunosPorTurno(alunos);
      expect(agrupados.Manhã.length).toBe(2);
      expect(agrupados.Tarde.length).toBe(1);
      expect(agrupados.Noite.length).toBe(0);
      expect(agrupados.Integral.length).toBe(1);
      expect(agrupados.Outros.length).toBe(1);
    });

    it("Deve calcular o resumo numérico de alunos por turno", () => {
      const alunos: AlunoComPeriodo[] = [
        { periodo: "manha" },
        { periodo: "tarde" },
        { periodo: "tarde" },
        { periodo: "noite" },
      ];

      const resumo = calcularResumoAlunosPorTurno(alunos);
      expect(resumo).toEqual({
        Manhã: 1,
        Tarde: 2,
        Noite: 1,
        Integral: 0,
        Outros: 0,
      });
    });
  });
});
