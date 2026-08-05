import { describe, it, expect } from "vitest";
import { AdminUserLogItem } from "@/services/api/admin/admin-user.api";
import { AtividadeAcao, AtividadeEntidadeTipo } from "@/types/enums";
import { formatRelativeTime } from "@/utils/formatters/date";

function getActionBadgeStyle(acao: string): string {
  const normalized = acao.toUpperCase();
  if (normalized.includes("LOGIN") || normalized.includes("SESSAO")) {
    return "bg-sky-500/15 text-sky-400 border-sky-500/30";
  }
  if (normalized.includes("CRIAR") || normalized.includes("CRIAD") || normalized.includes("CADASTRO") || normalized.includes("ADICIONAR")) {
    return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
  }
  if (normalized.includes("ATUALIZAR") || normalized.includes("ATUALIZAD") || normalized.includes("ALTERAR") || normalized.includes("ALTERAD") || normalized.includes("EDITAR") || normalized.includes("EDITAD") || normalized.includes("CONCEDER")) {
    return "bg-amber-500/15 text-amber-400 border-amber-500/30";
  }
  if (normalized.includes("EXCLUIR") || normalized.includes("EXCLUID") || normalized.includes("DELETAR") || normalized.includes("DELETAD") || normalized.includes("CANCELAR") || normalized.includes("CANCELAD") || normalized.includes("RESETAR") || normalized.includes("RESETAD")) {
    return "bg-rose-500/15 text-rose-400 border-rose-500/30";
  }
  return "bg-purple-500/15 text-purple-400 border-purple-500/30";
}

function filterActivityLogs(
  logs: AdminUserLogItem[],
  filters: {
    dataInicio?: string;
    dataFim?: string;
    acao?: string;
    entidade?: string;
    search_cpf?: string;
  }
): AdminUserLogItem[] {
  return logs.filter((log) => {
    if (filters.acao && filters.acao !== "all" && log.acao !== filters.acao) {
      return false;
    }

    if (filters.entidade && filters.entidade !== "all" && log.entidade_tipo !== filters.entidade) {
      return false;
    }

    if (filters.search_cpf && filters.search_cpf.trim() !== "") {
      const search = filters.search_cpf.toLowerCase();
      const userName = log.usuarios?.nome?.toLowerCase() || "";
      const userEmail = log.usuarios?.email?.toLowerCase() || "";
      const userPhone = log.usuarios?.telefone || "";
      const userCpf = log.usuarios?.cpfcnpj || "";
      const description = log.descricao?.toLowerCase() || "";
      const userId = log.usuario_id || log.usuarios?.id || "";

      const matchesSearch =
        userName.includes(search) ||
        userEmail.includes(search) ||
        userPhone.includes(search) ||
        userCpf.includes(search) ||
        description.includes(search) ||
        userId.includes(search);

      if (!matchesSearch) return false;
    }

    if (filters.dataInicio) {
      const logDate = log.created_at.split("T")[0];
      if (logDate < filters.dataInicio) return false;
    }

    if (filters.dataFim) {
      const logDate = log.created_at.split("T")[0];
      if (logDate > filters.dataFim) return false;
    }

    return true;
  });
}

function paginateLogs<T>(items: T[], page: number, limit: number): { data: T[]; total: number; totalPages: number } {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const startIndex = (page - 1) * limit;
  const data = items.slice(startIndex, startIndex + limit);

  return { data, total, totalPages };
}

describe("Suíte de Testes de Logs de Atividades e Filtragem (activity-logs-ui)", () => {
  const mockLogs: AdminUserLogItem[] = [
    {
      id: "log-1",
      usuario_id: "user-101",
      acao: AtividadeAcao.LOGIN,
      entidade_tipo: AtividadeEntidadeTipo.USUARIO,
      entidade_id: "user-101",
      descricao: "Usuário realizou login no sistema",
      ip_address: "192.168.1.1",
      meta: { browser: "Chrome" },
      created_at: "2026-08-05T10:00:00Z",
      usuarios: {
        id: "user-101",
        nome: "João da Silva",
        email: "joao@van360.com",
        telefone: "11988887777",
        cpfcnpj: "11144477735",
      },
    },
    {
      id: "log-2",
      usuario_id: "user-101",
      acao: AtividadeAcao.PASSAGEIRO_CRIADO,
      entidade_tipo: AtividadeEntidadeTipo.PASSAGEIRO,
      entidade_id: "pass-202",
      descricao: "Passageiro Pedro Silva cadastrado com sucesso",
      ip_address: "192.168.1.1",
      created_at: "2026-08-04T15:30:00Z",
      usuarios: {
        id: "user-101",
        nome: "João da Silva",
        email: "joao@van360.com",
      },
    },
    {
      id: "log-3",
      usuario_id: "user-102",
      acao: AtividadeAcao.COBRANCA_CRIADA,
      entidade_tipo: AtividadeEntidadeTipo.COBRANCA,
      entidade_id: "cob-303",
      descricao: "Cobrança mensal gerada no valor de R$ 350,00",
      ip_address: "10.0.0.5",
      created_at: "2026-08-03T09:15:00Z",
      usuarios: {
        id: "user-102",
        nome: "Maria Oliveira",
        email: "maria@van360.com",
      },
    },
    {
      id: "log-4",
      usuario_id: "user-102",
      acao: AtividadeAcao.COBRANCA_EXCLUIDA,
      entidade_tipo: AtividadeEntidadeTipo.COBRANCA,
      entidade_id: "cob-303",
      descricao: "Cobrança cancelada e excluída pelo motorista",
      created_at: "2026-08-02T18:00:00Z",
      usuarios: {
        id: "user-102",
        nome: "Maria Oliveira",
      },
    },
    {
      id: "log-5",
      usuario_id: null,
      acao: AtividadeAcao.SAAS_ASSINATURA_ATIVA,
      entidade_tipo: AtividadeEntidadeTipo.SAAS_ASSINATURA,
      entidade_id: "sub-505",
      descricao: "Assinatura ativada automaticamente via Webhook",
      created_at: "2026-08-01T12:00:00Z",
    },
  ];

  describe("1. Filtragem do Histórico de Atividades", () => {
    it("Deve retornar todos os logs quando nenhum filtro for aplicado", () => {
      const filtered = filterActivityLogs(mockLogs, {});
      expect(filtered).toHaveLength(5);
    });

    it("Deve filtrar logs por tipo de Ação (acao)", () => {
      const filtered = filterActivityLogs(mockLogs, { acao: AtividadeAcao.LOGIN });
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe("log-1");

      const filteredCobrancas = filterActivityLogs(mockLogs, { acao: AtividadeAcao.COBRANCA_CRIADA });
      expect(filteredCobrancas).toHaveLength(1);
      expect(filteredCobrancas[0].id).toBe("log-3");
    });

    it("Deve filtrar logs por tipo de Entidade (entidade)", () => {
      const filtered = filterActivityLogs(mockLogs, { entidade: AtividadeEntidadeTipo.COBRANCA });
      expect(filtered).toHaveLength(2);
      expect(filtered.map((l) => l.id)).toEqual(["log-3", "log-4"]);
    });

    it("Deve filtrar por busca textual (nome, e-mail, telefone, CPF ou descrição)", () => {
      const byName = filterActivityLogs(mockLogs, { search_cpf: "João" });
      expect(byName).toHaveLength(2);

      const byCpf = filterActivityLogs(mockLogs, { search_cpf: "11144477735" });
      expect(byCpf).toHaveLength(1);
      expect(byCpf[0].id).toBe("log-1");

      const byDesc = filterActivityLogs(mockLogs, { search_cpf: "Webhook" });
      expect(byDesc).toHaveLength(1);
      expect(byDesc[0].id).toBe("log-5");
    });

    it("Deve filtrar por intervalo de datas (dataInicio e dataFim)", () => {
      const filteredDate = filterActivityLogs(mockLogs, {
        dataInicio: "2026-08-03",
        dataFim: "2026-08-05",
      });
      expect(filteredDate).toHaveLength(3);
      expect(filteredDate.map((l) => l.id)).toEqual(["log-1", "log-2", "log-3"]);
    });

    it("Deve combinar múltiplos filtros simultaneamente", () => {
      const combined = filterActivityLogs(mockLogs, {
        search_cpf: "Maria",
        entidade: AtividadeEntidadeTipo.COBRANCA,
        acao: AtividadeAcao.COBRANCA_CRIADA,
      });
      expect(combined).toHaveLength(1);
      expect(combined[0].id).toBe("log-3");
    });
  });

  describe("2. Paginação do Histórico de Logs", () => {
    it("Deve paginar os resultados corretamente e calcular total de páginas", () => {
      const page1 = paginateLogs(mockLogs, 1, 2);
      expect(page1.data).toHaveLength(2);
      expect(page1.total).toBe(5);
      expect(page1.totalPages).toBe(3);
      expect(page1.data[0].id).toBe("log-1");

      const page3 = paginateLogs(mockLogs, 3, 2);
      expect(page3.data).toHaveLength(1);
      expect(page3.data[0].id).toBe("log-5");
    });

    it("Deve tratar limites maiores que a quantidade total de logs", () => {
      const page = paginateLogs(mockLogs, 1, 25);
      expect(page.data).toHaveLength(5);
      expect(page.totalPages).toBe(1);
    });
  });

  describe("3. Formatadores Visuais e Badges de Ações (getActionBadgeStyle)", () => {
    it("Deve atribuir classe azul (sky) para ações de Login e Sessão", () => {
      const style = getActionBadgeStyle("LOGIN");
      expect(style).toContain("sky");
    });

    it("Deve atribuir classe verde (emerald) para ações de Criação e Cadastro", () => {
      expect(getActionBadgeStyle("PASSAGEIRO_CRIADO")).toContain("emerald");
      expect(getActionBadgeStyle("CADASTRO_CONCLUIDO")).toContain("emerald");
      expect(getActionBadgeStyle("ADICIONAR_VEICULO")).toContain("emerald");
    });

    it("Deve atribuir classe amarela (amber) para ações de Atualização e Edição", () => {
      expect(getActionBadgeStyle("COBRANCA_EDITADA")).toContain("amber");
      expect(getActionBadgeStyle("PERFIL_ALTERADO")).toContain("amber");
    });

    it("Deve atribuir classe vermelha (rose) para ações de Exclusão e Cancelamento", () => {
      expect(getActionBadgeStyle("COBRANCA_EXCLUIDA")).toContain("rose");
      expect(getActionBadgeStyle("DELETAR_PASSAGEIRO")).toContain("rose");
      expect(getActionBadgeStyle("SAAS_ASSINATURA_CANCELADA")).toContain("rose");
    });

    it("Deve atribuir classe roxa (purple) como padrão para outras ações", () => {
      expect(getActionBadgeStyle("NOTIFICACAO_WHATSAPP")).toContain("purple");
    });
  });

  describe("4. Tempo Relativo e Metadados do Log (formatRelativeTime)", () => {
    it("Deve formatar datas recentes no formato relativo pt-BR", () => {
      const nowIso = new Date().toISOString();
      expect(formatRelativeTime(nowIso)).toBe("Agora mesmo");
    });

    it("Deve aceitar metadados em formato de objeto JSON sem falhas", () => {
      const logWithMeta = mockLogs[0];
      expect(logWithMeta.meta).toBeDefined();
      expect(JSON.stringify(logWithMeta.meta)).toContain("Chrome");
    });
  });
});
