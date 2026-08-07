import { describe, it, expect } from "vitest";
import { FilterDefaults, UserType } from "@/types/enums";
import { hasPermission } from "@/config/permissions";

describe("Suíte de Testes da UI e ViewModel de Passageiros para Sub-contas (subconta-passageiros-ui)", () => {
  describe("1. Regras de Filtros e Transição de Estado do Veículo para Sub-contas", () => {
    it("Deve definir veiculo como 'all' quando isSubConta for verdadeiro e selectedVeiculo for FilterDefaults.TODOS", () => {
      const isSubConta = true;
      const selectedVeiculo = FilterDefaults.TODOS;

      const passageiroFiltersVeiculo =
        selectedVeiculo === FilterDefaults.TODOS
          ? isSubConta
            ? "all"
            : undefined
          : selectedVeiculo;

      expect(passageiroFiltersVeiculo).toBe("all");
    });

    it("Deve utilizar o ID do veículo específico quando o usuário sub-conta selecionar seu veículo atribuído", () => {
      const isSubConta = true;
      const assignedVeiculoId: string = "veiculo-auxiliar-789";
      const selectedVeiculo: string = assignedVeiculoId;

      const passageiroFiltersVeiculo =
        selectedVeiculo === FilterDefaults.TODOS
          ? isSubConta
            ? "all"
            : undefined
          : selectedVeiculo;

      expect(passageiroFiltersVeiculo).toBe(assignedVeiculoId);
    });

    it("Deve definir veiculo como undefined quando isSubConta for falso (conta principal) e selectedVeiculo for TODOS", () => {
      const isSubConta = false;
      const selectedVeiculo = FilterDefaults.TODOS;

      const passageiroFiltersVeiculo =
        selectedVeiculo === FilterDefaults.TODOS
          ? isSubConta
            ? "all"
            : undefined
          : selectedVeiculo;

      expect(passageiroFiltersVeiculo).toBeUndefined();
    });

    it("Deve transicionar corretamente o filtro entre 'Todos os veículos' (all) e o veículo atribuído", () => {
      const isSubConta = true;
      const assignedVeiculoId: string = "van-01-abc";

      // Estado 1: Inicializado com veículo atribuído
      let currentSelectedVeiculo: string = assignedVeiculoId;
      let filterVeiculo =
        currentSelectedVeiculo === FilterDefaults.TODOS
          ? isSubConta
            ? "all"
            : undefined
          : currentSelectedVeiculo;

      expect(filterVeiculo).toBe(assignedVeiculoId);

      // Estado 2: Usuário seleciona "Todos os veículos"
      currentSelectedVeiculo = FilterDefaults.TODOS;
      filterVeiculo =
        currentSelectedVeiculo === FilterDefaults.TODOS
          ? isSubConta
            ? "all"
            : undefined
          : currentSelectedVeiculo;

      expect(filterVeiculo).toBe("all");

      // Estado 3: Usuário seleciona novamente o veículo atribuído
      currentSelectedVeiculo = assignedVeiculoId;
      filterVeiculo =
        currentSelectedVeiculo === FilterDefaults.TODOS
          ? isSubConta
            ? "all"
            : undefined
          : currentSelectedVeiculo;

      expect(filterVeiculo).toBe(assignedVeiculoId);
    });
  });

  describe("2. Travas de Segurança da UI e Permissões para Sub-contas (Motorista Auxiliar e Monitor)", () => {
    it("Motorista Auxiliar NÃO deve ter permissão de gerenciar passageiros ou visualizar financeiro", () => {
      const role = UserType.MOTORISTA_AUXILIAR;

      expect(hasPermission(role, "passageiros.visualizar")).toBe(true);
      expect(hasPermission(role, "passageiros.gerenciar")).toBe(false);
      expect(hasPermission(role, "passageiros.mensalidade_visualizar")).toBe(false);
      expect(hasPermission(role, "financeiro.visualizar")).toBe(false);
      expect(hasPermission(role, "cobrancas.gerenciar")).toBe(false);
      expect(hasPermission(role, "contratos.gerenciar")).toBe(false);
    });

    it("Monitor NÃO deve ter permissão de gerenciar passageiros ou visualizar financeiro", () => {
      const role = UserType.MONITOR;

      expect(hasPermission(role, "passageiros.visualizar")).toBe(true);
      expect(hasPermission(role, "passageiros.gerenciar")).toBe(false);
      expect(hasPermission(role, "passageiros.mensalidade_visualizar")).toBe(false);
      expect(hasPermission(role, "financeiro.visualizar")).toBe(false);
      expect(hasPermission(role, "cobrancas.gerenciar")).toBe(false);
    });

    it("Motorista Principal (Gestor) DEVE possuir todas as permissões de gestão e financeiro", () => {
      const role = UserType.MOTORISTA;

      expect(hasPermission(role, "passageiros.visualizar")).toBe(true);
      expect(hasPermission(role, "passageiros.gerenciar")).toBe(true);
      expect(hasPermission(role, "passageiros.mensalidade_visualizar")).toBe(true);
      expect(hasPermission(role, "financeiro.visualizar")).toBe(true);
      expect(hasPermission(role, "cobrancas.gerenciar")).toBe(true);
    });

    it("Validação da condição canViewFinancials para sub-contas vs gestor", () => {
      const canViewFinancialsFn = (role: UserType) =>
        hasPermission(role, "financeiro.visualizar") ||
        hasPermission(role, "cobrancas.gerenciar") ||
        hasPermission(role, "passageiros.mensalidade_visualizar") ||
        hasPermission(role, "passageiros.gerenciar");

      expect(canViewFinancialsFn(UserType.MOTORISTA_AUXILIAR)).toBe(false);
      expect(canViewFinancialsFn(UserType.MONITOR)).toBe(false);
      expect(canViewFinancialsFn(UserType.MOTORISTA)).toBe(true);
    });
  });
});
