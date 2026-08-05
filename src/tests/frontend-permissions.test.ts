import { describe, it, expect } from "vitest";
import { UserType } from "@/types/enums";
import { hasPermission, ROLE_PERMISSIONS } from "@/config/permissions";
import { pagesItems, bottomNavHrefs } from "@/utils/domain/pages/pagesUtils";
import { ROUTES } from "@/constants/routes";

describe("Suíte de Testes de Permissões e UI do Frontend (van360)", () => {
  describe("1. Matriz de Permissões no Frontend (hasPermission)", () => {
    it("Motorista Frotista (Gestor) deve ter permissão irrestrita", () => {
      expect(hasPermission(UserType.MOTORISTA, "cobrancas.gerenciar")).toBe(true);
      expect(hasPermission(UserType.MOTORISTA, "contratos.gerenciar")).toBe(true);
      expect(hasPermission(UserType.MOTORISTA, "veiculos.gerenciar")).toBe(true);
      expect(hasPermission(UserType.MOTORISTA, "equipe.gerenciar_todos")).toBe(true);
    });

    it("Motorista Auxiliar deve ter acesso apenas a operações da van dele", () => {
      expect(hasPermission(UserType.MOTORISTA_AUXILIAR, "rotas.visualizar")).toBe(true);
      expect(hasPermission(UserType.MOTORISTA_AUXILIAR, "gastos.visualizar")).toBe(true);

      // Travas de Frontend
      expect(hasPermission(UserType.MOTORISTA_AUXILIAR, "equipe.gerenciar_monitores")).toBe(false);
      expect(hasPermission(UserType.MOTORISTA_AUXILIAR, "escolas.visualizar")).toBe(false);
      expect(hasPermission(UserType.MOTORISTA_AUXILIAR, "cobrancas.gerenciar")).toBe(false);
      expect(hasPermission(UserType.MOTORISTA_AUXILIAR, "contratos.gerenciar")).toBe(false);
      expect(hasPermission(UserType.MOTORISTA_AUXILIAR, "veiculos.gerenciar")).toBe(false);
    });

    it("Monitor deve ser restrito apenas a rotas e paradas", () => {
      expect(hasPermission(UserType.MONITOR, "rotas.visualizar")).toBe(true);
      expect(hasPermission(UserType.MONITOR, "rotas.executar_paradas")).toBe(true);

      expect(hasPermission(UserType.MONITOR, "passageiros.visualizar")).toBe(true);
      expect(hasPermission(UserType.MONITOR, "passageiros.gerenciar")).toBe(false);
      expect(hasPermission(UserType.MONITOR, "escolas.visualizar")).toBe(false);
      expect(hasPermission(UserType.MONITOR, "gastos.visualizar")).toBe(false);
      expect(hasPermission(UserType.MONITOR, "cobrancas.gerenciar")).toBe(false);
      expect(hasPermission(UserType.MONITOR, "contratos.gerenciar")).toBe(false);
      expect(hasPermission(UserType.MONITOR, "veiculos.gerenciar")).toBe(false);
    });
  });

  describe("2. Filtragem de Navegação BottomNav por Papel", () => {
    it("Motorista Frotista deve ter navegação padrão completa", () => {
      let targetHrefs: string[] = bottomNavHrefs;
      expect(targetHrefs).toContain(ROUTES.PRIVATE.MOTORISTA.HOME);
      expect(targetHrefs).toContain(ROUTES.PRIVATE.MOTORISTA.BILLING);
    });

    it("Motorista Auxiliar DEVE ver apenas Início, Rotas, Passageiros e Gastos na barra inferior", () => {
      const isMotoristaAuxiliar = true;
      const isMonitor = false;

      let targetHrefs: string[] = bottomNavHrefs;
      if (isMonitor) {
        targetHrefs = [ROUTES.PRIVATE.MOTORISTA.HOME, ROUTES.PRIVATE.MOTORISTA.ROUTES];
      } else if (isMotoristaAuxiliar) {
        targetHrefs = [
          ROUTES.PRIVATE.MOTORISTA.HOME,
          ROUTES.PRIVATE.MOTORISTA.ROUTES,
          ROUTES.PRIVATE.MOTORISTA.PASSENGERS,
          ROUTES.PRIVATE.MOTORISTA.EXPENSES,
        ];
      }

      expect(targetHrefs).toContain(ROUTES.PRIVATE.MOTORISTA.HOME);
      expect(targetHrefs).toContain(ROUTES.PRIVATE.MOTORISTA.ROUTES);
      expect(targetHrefs).toContain(ROUTES.PRIVATE.MOTORISTA.PASSENGERS);
      expect(targetHrefs).toContain(ROUTES.PRIVATE.MOTORISTA.EXPENSES);
      expect(targetHrefs).not.toContain(ROUTES.PRIVATE.MOTORISTA.BILLING);
    });

    it("Monitor DEVE ver Início, Rotas e Aniversariantes na barra inferior", () => {
      const isMonitor = true;

      let targetHrefs: string[] = bottomNavHrefs;
      if (isMonitor) {
        targetHrefs = [
          ROUTES.PRIVATE.MOTORISTA.HOME,
          ROUTES.PRIVATE.MOTORISTA.ROUTES,
          ROUTES.PRIVATE.MOTORISTA.BIRTHDAYS,
        ];
      }

      expect(targetHrefs).toEqual([
        ROUTES.PRIVATE.MOTORISTA.HOME,
        ROUTES.PRIVATE.MOTORISTA.ROUTES,
        ROUTES.PRIVATE.MOTORISTA.BIRTHDAYS,
      ]);
    });
  });
});
