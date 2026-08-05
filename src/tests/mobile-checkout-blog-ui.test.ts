import { describe, it, expect, vi } from "vitest";
import {
  calculatePullDistance,
  isThresholdReached,
  shouldTriggerPullGesture,
  processPullRelease,
  PULL_THRESHOLD,
  MAX_PULL,
} from "@/hooks/ui/usePullToRefresh";
import {
  extractCheckoutBridgeParams,
  pollPaymentConfirmation,
} from "@/utils/checkoutBridgeUtils";
import {
  adminBlogPostSchema,
} from "@/schemas/adminBlogSchema";
import {
  formatBlogSlug,
  filterPostsByTag,
} from "@/utils/blogUtils";
import { BlogPostStatus } from "@/types/enums";
import { AdminBlogPostItem } from "@/services/api/admin/admin-blog.api";
import { ROUTES } from "@/constants/routes";

describe("Suíte de Testes de UI Mobile, Checkout Bridge e Blog Admin (mobile-checkout-blog-ui.test.ts)", () => {
  describe("1. Gestos Mobile (usePullToRefresh.ts & PullToRefreshWrapper.tsx)", () => {
    describe("1.1 Cálculo de Distância de Arrasto (calculatePullDistance)", () => {
      it("Deve retornar 0 quando a distância puxada for zero ou negativa", () => {
        expect(calculatePullDistance(0)).toBe(0);
        expect(calculatePullDistance(-50)).toBe(0);
      });

      it("Deve aplicar o fator de resistência de 0.8 por padrão", () => {
        expect(calculatePullDistance(50)).toBe(40);
        expect(calculatePullDistance(100)).toBe(80);
      });

      it("Deve limitar a distância ao valor máximo definido por MAX_PULL (130px)", () => {
        expect(calculatePullDistance(200)).toBe(MAX_PULL);
        expect(calculatePullDistance(500)).toBe(130);
      });

      it("Deve aceitar parâmetros customizados de maxPull e resistanceFactor", () => {
        expect(calculatePullDistance(100, 50, 0.5)).toBe(50);
        expect(calculatePullDistance(60, 200, 0.5)).toBe(30);
      });
    });

    describe("1.2 Threshold de Ativação do Refresh (isThresholdReached)", () => {
      it("Deve retornar false quando a distância puxada for menor que o threshold (60px)", () => {
        expect(isThresholdReached(0)).toBe(false);
        expect(isThresholdReached(59)).toBe(false);
        expect(isThresholdReached(30, PULL_THRESHOLD)).toBe(false);
      });

      it("Deve retornar true quando a distância atingir ou ultrapassar o threshold", () => {
        expect(isThresholdReached(60)).toBe(true);
        expect(isThresholdReached(100)).toBe(true);
        expect(isThresholdReached(MAX_PULL)).toBe(true);
      });
    });

    describe("1.3 Validação de Condições de Disparo do Gesto (shouldTriggerPullGesture)", () => {
      it("Deve permitir o gesto se scrollY for 0 e movimento for vertical para baixo", () => {
        const canTrigger = shouldTriggerPullGesture({
          diffY: 50,
          diffX: 10,
          scrollY: 0,
        });
        expect(canTrigger).toBe(true);
      });

      it("Deve ignorar o gesto se a página já estiver rolada (scrollY > 0)", () => {
        const canTrigger = shouldTriggerPullGesture({
          diffY: 50,
          diffX: 10,
          scrollY: 100,
        });
        expect(canTrigger).toBe(false);
      });

      it("Deve ignorar o gesto quando houver rolagem horizontal predominante (diffX > diffY)", () => {
        const canTrigger = shouldTriggerPullGesture({
          diffY: 20,
          diffX: 80,
          scrollY: 0,
        });
        expect(canTrigger).toBe(false);
      });

      it("Deve ignorar o gesto se o refresh já estiver em andamento ou o scroll estiver bloqueado por modal", () => {
        expect(
          shouldTriggerPullGesture({
            diffY: 50,
            diffX: 5,
            scrollY: 0,
            isRefreshing: true,
          })
        ).toBe(false);

        expect(
          shouldTriggerPullGesture({
            diffY: 50,
            diffX: 5,
            scrollY: 0,
            isScrollLocked: true,
          })
        ).toBe(false);

        expect(
          shouldTriggerPullGesture({
            diffY: 50,
            diffX: 5,
            scrollY: 0,
            isInsideDialog: true,
          })
        ).toBe(false);
      });
    });

    describe("1.4 Acionamento da Callback de Recarga (processPullRelease)", () => {
      it("Deve executar a callback de recarga onRefresh quando o threshold for atingido e liberado", async () => {
        const mockOnRefresh = vi.fn().mockResolvedValue(undefined);
        const triggered = await processPullRelease({
          pullDistance: 80, // > PULL_THRESHOLD (60px)
          threshold: PULL_THRESHOLD,
          isRefreshing: false,
          onRefresh: mockOnRefresh,
        });

        expect(triggered).toBe(true);
        expect(mockOnRefresh).toHaveBeenCalledTimes(1);
      });

      it("Não deve disparar a callback se a distância puxada for inferior ao threshold", async () => {
        const mockOnRefresh = vi.fn().mockResolvedValue(undefined);
        const triggered = await processPullRelease({
          pullDistance: 40, // < PULL_THRESHOLD (60px)
          threshold: PULL_THRESHOLD,
          isRefreshing: false,
          onRefresh: mockOnRefresh,
        });

        expect(triggered).toBe(false);
        expect(mockOnRefresh).not.toHaveBeenCalled();
      });
    });
  });

  describe("2. Checkout Bridge (ExternalCheckoutBridge.tsx & checkoutBridgeUtils.ts)", () => {
    describe("2.1 Extração de Parâmetros de URL", () => {
      it("Deve extrair tokens válidos de sessão e definir rota de destino para assinatura", () => {
        const searchParams = new URLSearchParams(
          "?access_token=token_abc_123&refresh_token=refresh_xyz_789"
        );
        const result = extractCheckoutBridgeParams(searchParams);

        expect(result.isValid).toBe(true);
        expect(result.accessToken).toBe("token_abc_123");
        expect(result.refreshToken).toBe("refresh_xyz_789");
        expect(result.autoOpen).toBe(false);
        expect(result.targetRoute).toBe(ROUTES.PRIVATE.MOTORISTA.SUBSCRIPTION);
      });

      it("Deve incluir a flag open_checkout=true na rota quando auto_open=true", () => {
        const searchParams = new URLSearchParams(
          "?access_token=token_abc_123&refresh_token=refresh_xyz_789&auto_open=true"
        );
        const result = extractCheckoutBridgeParams(searchParams);

        expect(result.isValid).toBe(true);
        expect(result.autoOpen).toBe(true);
        expect(result.targetRoute).toBe(
          `${ROUTES.PRIVATE.MOTORISTA.SUBSCRIPTION}?open_checkout=true`
        );
      });

      it("Deve invalidar a autenticação se access_token estiver ausente", () => {
        const searchParams = new URLSearchParams("?refresh_token=refresh_xyz_789");
        const result = extractCheckoutBridgeParams(searchParams);

        expect(result.isValid).toBe(false);
        expect(result.accessToken).toBeNull();
        expect(result.targetRoute).toBe(ROUTES.PUBLIC.LOGIN);
      });

      it("Deve invalidar a autenticação se refresh_token estiver ausente", () => {
        const searchParams = new URLSearchParams("?access_token=token_abc_123");
        const result = extractCheckoutBridgeParams(searchParams);

        expect(result.isValid).toBe(false);
        expect(result.refreshToken).toBeNull();
        expect(result.targetRoute).toBe(ROUTES.PUBLIC.LOGIN);
      });
    });

    describe("2.2 Polling de Confirmação de Pagamento (pollPaymentConfirmation)", () => {
      it("Deve confirmar o pagamento na primeira tentativa se o status for PAID", async () => {
        const checkStatusMock = vi.fn().mockResolvedValue("PAID");

        const result = await pollPaymentConfirmation({
          checkStatus: checkStatusMock,
          maxAttempts: 3,
          intervalMs: 1,
        });

        expect(result.confirmed).toBe(true);
        expect(result.attempts).toBe(1);
        expect(result.finalStatus).toBe("PAID");
        expect(checkStatusMock).toHaveBeenCalledTimes(1);
      });

      it("Deve realizar polling continuamente até o status mudar para PAID", async () => {
        let callCount = 0;
        const checkStatusMock = vi.fn().mockImplementation(async () => {
          callCount++;
          if (callCount < 3) return "PENDING";
          return "PAID";
        });

        const result = await pollPaymentConfirmation({
          checkStatus: checkStatusMock,
          maxAttempts: 5,
          intervalMs: 1,
        });

        expect(result.confirmed).toBe(true);
        expect(result.attempts).toBe(3);
        expect(result.finalStatus).toBe("PAID");
      });

      it("Deve retornar confirmed=false se atingir o limite de tentativas sem pagamento", async () => {
        const checkStatusMock = vi.fn().mockResolvedValue("PENDING");

        const result = await pollPaymentConfirmation({
          checkStatus: checkStatusMock,
          maxAttempts: 4,
          intervalMs: 1,
        });

        expect(result.confirmed).toBe(false);
        expect(result.attempts).toBe(4);
        expect(result.finalStatus).toBe("PENDING");
        expect(checkStatusMock).toHaveBeenCalledTimes(4);
      });
    });
  });

  describe("3. Módulo de Blog Admin (AdminBlogPage.tsx & admin-blog.api.ts)", () => {
    describe("3.1 Esquema de Validação de Postagens (adminBlogPostSchema)", () => {
      it("Deve validar com sucesso uma postagem do blog válida", () => {
        const payload = {
          title: "5 Dicas para Gestão de Vans Escolares",
          content: "Conteúdo completo com dicas sobre otimização de rotas e segurança dos alunos.",
          excerpt: "Resumo sobre gestão de vans",
          tags: ["gestao", "rotas", "vans"],
          status: BlogPostStatus.PUBLISHED,
          cover_image_url: "https://example.com/imagem-capa.jpg",
        };

        const result = adminBlogPostSchema.safeParse(payload);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.title).toBe(payload.title);
          expect(result.data.status).toBe(BlogPostStatus.PUBLISHED);
        }
      });

      it("Deve rejeitar título com menos de 3 caracteres", () => {
        const payload = {
          title: "Oi",
          content: "Conteúdo extenso e válido com mais de dez caracteres",
        };

        const result = adminBlogPostSchema.safeParse(payload);
        expect(result.success).toBe(false);
      });

      it("Deve rejeitar conteúdo com menos de 10 caracteres", () => {
        const payload = {
          title: "Título Válido",
          content: "Curto",
        };

        const result = adminBlogPostSchema.safeParse(payload);
        expect(result.success).toBe(false);
      });

      it("Deve aplicar status Rascunho (DRAFT) por padrão quando omitido", () => {
        const payload = {
          title: "Novo Artigo Sem Status Explicitado",
          content: "Conteúdo descritivo e explicativo para teste de schema.",
        };

        const result = adminBlogPostSchema.safeParse(payload);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.status).toBe(BlogPostStatus.DRAFT);
        }
      });

      it("Deve rejeitar URL de capa inválida quando fornecida", () => {
        const payload = {
          title: "Artigo com Capa Inválida",
          content: "Conteúdo válido para postagem de teste.",
          cover_image_url: "url-invalida-sem-http",
        };

        const result = adminBlogPostSchema.safeParse(payload);
        expect(result.success).toBe(false);
      });
    });

    describe("3.2 Filtragem de Postagens por Tags (filterPostsByTag)", () => {
      const mockPosts: AdminBlogPostItem[] = [
        {
          id: "post-1",
          title: "Organização de Rotas",
          slug: "organizacao-de-rotas",
          content: "Conteúdo 1",
          excerpt: null,
          tags: ["rotas", "organizacao"],
          status: BlogPostStatus.PUBLISHED,
          author_id: null,
          cover_image_url: null,
          published_at: "2026-08-01",
          created_at: "2026-08-01",
          updated_at: "2026-08-01",
        },
        {
          id: "post-2",
          title: "Gestão Financeira",
          slug: "gestao-financeira",
          content: "Conteúdo 2",
          excerpt: null,
          tags: ["financas", "cobranca"],
          status: BlogPostStatus.PUBLISHED,
          author_id: null,
          cover_image_url: null,
          published_at: "2026-08-02",
          created_at: "2026-08-02",
          updated_at: "2026-08-02",
        },
        {
          id: "post-3",
          title: "Manutenção Preventiva de Vans",
          slug: "manutencao-preventiva",
          content: "Conteúdo 3",
          excerpt: null,
          tags: ["veiculos", "rotas"],
          status: BlogPostStatus.DRAFT,
          author_id: null,
          cover_image_url: null,
          published_at: null,
          created_at: "2026-08-03",
          updated_at: "2026-08-03",
        },
      ];

      it("Deve filtrar postagens que contêm a tag solicitada", () => {
        const filtered = filterPostsByTag(mockPosts, "rotas");
        expect(filtered.length).toBe(2);
        expect(filtered.map((p) => p.id)).toEqual(["post-1", "post-3"]);
      });

      it("Deve realizar a busca por tag sem diferenciar maiúsculas/minúsculas", () => {
        const filtered = filterPostsByTag(mockPosts, "FINANCAS");
        expect(filtered.length).toBe(1);
        expect(filtered[0].id).toBe("post-2");
      });

      it("Deve retornar todas as postagens quando a tag for vazia ou 'todos'", () => {
        expect(filterPostsByTag(mockPosts, null).length).toBe(3);
        expect(filterPostsByTag(mockPosts, "").length).toBe(3);
        expect(filterPostsByTag(mockPosts, "todos").length).toBe(3);
      });

      it("Deve retornar array vazio quando nenhuma postagem contiver a tag", () => {
        const filtered = filterPostsByTag(mockPosts, "inexistente");
        expect(filtered.length).toBe(0);
      });
    });

    describe("3.3 Formatação de Slug (formatBlogSlug)", () => {
      it("Deve converter título em slug amigável em caixa baixa com hífens", () => {
        const slug = formatBlogSlug("5 Dicas para Organizar Rotas Escolares");
        expect(slug).toBe("5-dicas-para-organizar-rotas-escolares");
      });

      it("Deve remover acentuação e caracteres especiais em português", () => {
        const slug = formatBlogSlug("Gestão, Organização & Ações de Cobrança!");
        expect(slug).toBe("gestao-organizacao-acoes-de-cobranca");
      });

      it("Deve remover hífens duplicados e nas extremidades da string", () => {
        const slug = formatBlogSlug("---Atenção: Rotas de Vans---");
        expect(slug).toBe("atencao-rotas-de-vans");
      });

      it("Deve tratar string vazia sem lançar erros", () => {
        expect(formatBlogSlug("")).toBe("");
      });
    });
  });
});
