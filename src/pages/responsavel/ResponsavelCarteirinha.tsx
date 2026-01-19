// React
import React, { useEffect, useMemo, useState } from "react";

// React Router
import { ROUTES } from "@/constants/routes";
import { useNavigate } from "react-router-dom";

// Components - Responsavel
import AppNavbarResponsavel from "@/components/responsavel/AppNavbarResponsavel";

// Components - UI
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Services
import { useAvailableYears } from "@/hooks";
import { supabase } from "@/integrations/supabase/client";
import { responsavelService } from "@/services/responsavelService";

// Utils
import { seForPago } from "@/utils/domain/cobranca/disableActions";
import { formatarPlacaExibicao } from "@/utils/domain/veiculo/placaUtils";
import {
  formatarEnderecoCompleto,
  formatarTelefone,
  formatDateToBR,
  getMesNome,
  getStatusColor,
  getStatusText,
} from "@/utils/formatters";
import { toast } from "@/utils/notifications/toast";

// Types
import { Cobranca } from "@/types/cobranca";

// Icons
import { CobrancaStatus } from "@/types/enums";
import { clearAppSession } from "@/utils/domain";
import {
  AlertTriangle,
  Car,
  Contact,
  Info,
  Mail,
  MapPin,
  MessageCircle,
  MoreVertical,
  School,
} from "lucide-react";

interface CobrancaResponsavelActionsDropdownProps {
  cobranca: Cobranca;
  onAcessarLinkDePagamento: (cobranca: Cobranca) => void;
  triggerClassName?: string;
  triggerSize?: "sm" | "icon";
}

function CobrancaResponsavelActionsDropdown({
  cobranca,
  onAcessarLinkDePagamento,
  triggerClassName = "h-8 w-8 p-0",
  triggerSize = "sm",
}: CobrancaResponsavelActionsDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={triggerSize}
          className={triggerClassName}
          onClick={(e) => e.stopPropagation()}
        >
          <MoreVertical className="" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {!seForPago(cobranca) && (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onAcessarLinkDePagamento(cobranca);
            }}
          >
            Realizar Pagamento
          </DropdownMenuItem>
        )}
        {seForPago(cobranca) && (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            Ver Recibo
          </DropdownMenuItem>
        )}
        {seForPago(cobranca) && (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            Baixar Recibo
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const InfoItem = ({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
}) => (
  <div>
    <div className="text-sm text-muted-foreground flex items-center gap-2">
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </div>
    <div className="font-semibold text-foreground mt-1">{children || "-"}</div>
  </div>
);

export default function ResponsavelCarteirinha() {
  const navigate = useNavigate();
  const [passageiros, setPassageiros] = useState<any[]>([]);
  const [selectedPassageiro, setSelectedPassageiro] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(true);
  const [anoSelecionado, setAnoSelecionado] = useState<number | null>(null);
  const [cobrancas, setCobrancas] = useState<Cobranca[]>([]);
  const [mostrarTodasCobrancas, setMostrarTodasCobrancas] = useState(false);

  // Usar hook para buscar anos disponíveis
  const {
    data: anosBrutos = [],
    refetch: refetchAnos,
  } = useAvailableYears(selectedPassageiro?.id, {
    enabled: !!selectedPassageiro?.id,
  });

  const anos: number[] = useMemo(() => {
    return Array.from(
      new Set((anosBrutos as unknown as any[] || []).map((a: any) => Number(a)))
    ).sort((a: number, b: number) => b - a);
  }, [anosBrutos]);

  const cpf = localStorage.getItem("responsavel_cpf");
  const email = localStorage.getItem("responsavel_email");
  const passageiroIdStorage = localStorage.getItem("responsavel_id");

  const COBRANCAS_LIMIT = 2;

  const cobrancasParaExibir = mostrarTodasCobrancas
    ? cobrancas
    : cobrancas.slice(0, COBRANCAS_LIMIT);

  useEffect(() => {
    carregar();
  }, []);

  const handleAcessarLinkDePagamento = (cobranca: Cobranca) => {
    toast.error("cobranca.erro.linkPagamentoIndisponivel", {
      description: "cobranca.info.linkPagamentoDescricao",
    });
  };

  const carregar = async () => {
    try {
      if (!cpf || !email) {
        navigate(ROUTES.PUBLIC.LOGIN);
        return;
      }

      setRefreshing(true);
      const lista = await responsavelService.loginPorCpfEmail(cpf!, email!);
      if (!lista || lista.length === 0) {
        clearAppSession();
        navigate(ROUTES.PUBLIC.LOGIN);
      }

      setPassageiros(lista);

      if (lista.length > 1 && !passageiroIdStorage) {
        navigate(ROUTES.PRIVATE.RESPONSAVEL.SELECT, {
          state: { passageiros: lista },
        });
        return;
      }

      const atual = lista.find((p) => p.id === passageiroIdStorage) || lista[0];
      setSelectedPassageiro(atual);
      localStorage.setItem("responsavel_id", atual.id);

      const currentYear = new Date().getFullYear();
      setAnoSelecionado(currentYear || null);

      const anoParaBuscar = anos.length > 0 ? anos[0] : currentYear;
      const { data, error } = await supabase
        .from("cobrancas")
        .select(`*, passageiros:passageiro_id (nome, nome_responsavel)`)
        .eq("passageiro_id", atual.id)
        .eq("usuario_id", localStorage.getItem("responsavel_usuario_id"))
        .eq("ano", anoParaBuscar)
        .order("mes", { ascending: false });

      if (error) {
        // Erro silencioso - dados já são carregados via hooks
      }
      setCobrancas(data || []);
    } catch (err: any) {
      toast.error("cobranca.erro.carregar", {
        description: err.message || "Não foi possível carregar as informações.",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleChangePassageiro = async (id: string) => {
    try {
      setRefreshing(true);
      const p = passageiros.find((x) => x.id === id);
      setSelectedPassageiro(p);
      localStorage.setItem("responsavel_id", p.id);
      
      await refetchAnos();
      setAnoSelecionado(anos.length > 0 ? anos[0] : null);

      const anoParaBuscar = anos.length > 0 ? anos[0] : null;
      if (!anoParaBuscar) {
        setRefreshing(false);
        return;
      }
      
      const { data, error } = await supabase
        .from("cobrancas")
        .select(`*, passageiros:passageiro_id (nome, nome_responsavel)`)
        .eq("passageiro_id", p.id)
        .eq("usuario_id", localStorage.getItem("responsavel_usuario_id"))
        .eq("ano", anoParaBuscar)
        .order("mes", { ascending: false });
      setCobrancas(data || []);
    } catch (error: any) {
      toast.error("passageiro.erro.alterar", {
        description: error.message || "Não foi possível concluir a operação.",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleChangeAno = async (ano: number) => {
    setRefreshing(true);
    try {
      setAnoSelecionado(ano);
      if (!selectedPassageiro) return;
      const { data, error } = await supabase
        .from("cobrancas")
        .select(`*, passageiros:passageiro_id (nome, nome_responsavel)`)
        .eq("passageiro_id", selectedPassageiro.id)
        .eq("usuario_id", localStorage.getItem("responsavel_usuario_id"))
        .eq("ano", ano)
        .order("mes", { ascending: false });
      setCobrancas(data || []);
    } catch (error: any) {
      toast.error("cobranca.erro.listarAno");
    } finally {
      setRefreshing(false);
    }
  };

  if (refreshing || !selectedPassageiro) {
    return (
      <>
        <div className="min-h-screen flex flex-col">
          <AppNavbarResponsavel
            title="Carregando..."
            subTitle="Por favor, Aguarde."
          />
        </div>
        <LoadingOverlay active text="Aguarde..." />
      </>
    );
  }

  return (
    <>
      <AppNavbarResponsavel
        title={`Carteirinha Digital ${anoSelecionado}`}
        subTitle={`${selectedPassageiro?.nome} (${selectedPassageiro?.nome_responsavel})`}
      />
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="space-y-6 max-w-5xl mx-auto w-full">
          {passageiros.length > 1 && (
            <Card className="shadow-sm">
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="space-y-1">
                    <div className="font-bold text-lg text-gray-800 hidden md:block">
                      {selectedPassageiro?.nome}
                    </div>
                    <div className="font-bold text-lg text-gray-800 hidden md:block">
                      <Badge
                        variant={
                          selectedPassageiro.ativo ? "outline" : "destructive"
                        }
                        className={
                          selectedPassageiro.ativo
                            ? "bg-green-600 text-white"
                            : ""
                        }
                      >
                        {selectedPassageiro.ativo ? "Ativo" : "Desativado"}
                      </Badge>
                    </div>
                  </div>
                  <div className="w-full md:w-1/3">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Passageiro</Label>
                      <Select
                        onValueChange={(v) => handleChangePassageiro(v)}
                        defaultValue={selectedPassageiro.id}
                      >
                        <SelectTrigger className="h-11 rounded-xl bg-white border-gray-200">
                          <SelectValue placeholder="Trocar Passageiro" />
                        </SelectTrigger>
                        <SelectContent>
                          {passageiros.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          <div className="space-y-6">
            <div className="flex flex-col gap-6 lg:grid lg:grid-cols-3 lg:gap-6 lg:items-start">
              {/* Cobranças */}
              <div className="order-1 lg:order-2 lg:col-span-2 lg:row-start-1 lg:h-full">
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Cobranças</CardTitle>
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-muted-foreground hidden sm:block">
                          Ano:
                        </label>
                        <Select
                          value={String(anoSelecionado)}
                          onValueChange={(v) => handleChangeAno(Number(v))}
                        >
                          <SelectTrigger className="w-[100px] text-sm h-9 rounded-lg bg-white border-gray-200">
                            <SelectValue placeholder="Ano" />
                          </SelectTrigger>
                          <SelectContent>
                            {anos.map((ano) => (
                              <SelectItem key={ano} value={String(ano)}>
                                {ano}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="mt-4">
                    {cobrancas.length > 0 ? (
                      <>
                        <div className="hidden md:block">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b">
                                <th className="p-4 text-left text-xs font-medium text-gray-600">
                                  Mês
                                </th>
                                <th className="p-4 text-left text-xs font-medium text-gray-600">
                                  Status
                                </th>
                                <th className="p-4 text-left text-xs font-medium text-gray-600">
                                  Valor
                                </th>
                                <th className="p-4 text-left text-xs font-medium text-gray-600">
                                  Vencimento
                                </th>
                                <th className="p-4 text-center text-xs font-medium text-gray-600">
                                  Ações
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {cobrancas.map((cobranca) => (
                                <tr key={cobranca.id}>
                                  <td className="p-4 align-top font-medium">
                                    {getMesNome(cobranca.mes)}
                                  </td>
                                  <td className="p-4 align-top">
                                    <span
                                      className={`px-2 py-1 inline-block rounded-full text-xs font-medium ${getStatusColor(
                                        cobranca.status,
                                        cobranca.data_vencimento
                                      )}`}
                                    >
                                      {getStatusText(
                                        cobranca.status,
                                        cobranca.data_vencimento
                                      )}
                                      {cobranca.status === CobrancaStatus.PAGO
                                        ? ` em ${formatDateToBR(
                                            cobranca.data_pagamento
                                          )} `
                                        : ""}
                                    </span>
                                  </td>
                                  <td className="p-4 align-top">
                                    {cobranca.valor.toLocaleString("pt-BR", {
                                      style: "currency",
                                      currency: "BRL",
                                    })}
                                  </td>
                                  <td className="p-4 align-top">
                                    {formatDateToBR(cobranca.data_vencimento)}
                                  </td>
                                  <td className="p-4 text-center align-top">
                                    <CobrancaResponsavelActionsDropdown
                                      cobranca={cobranca}
                                      onAcessarLinkDePagamento={handleAcessarLinkDePagamento}
                                    />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div className="md:hidden -mx-6 -mt-6 divide-y divide-gray-100 px-6">
                          {cobrancasParaExibir.map((cobranca) => (
                            <div key={cobranca.id} className="py-2.5">
                              <div className="flex justify-between items-start">
                                <div className="flex flex-col pr-1 w-2/3">
                                  <div className="font-semibold text-gray-800 text-sm overflow-hidden text-ellipsis whitespace-nowrap">
                                    {getMesNome(cobranca.mes)}
                                  </div>
                                  <div className="text-xs text-muted-foreground mt-0.5 overflow-hidden text-ellipsis whitespace-nowrap">
                                    Vencimento:{" "}
                                    <span className="font-medium text-gray-700">
                                      {formatDateToBR(cobranca.data_vencimento)}
                                    </span>
                                  </div>
                                </div>
                                <CobrancaResponsavelActionsDropdown
                                  cobranca={cobranca}
                                  onAcessarLinkDePagamento={handleAcessarLinkDePagamento}
                                  triggerClassName="h-8 w-8 shrink-0 -mr-2 -mt-1"
                                  triggerSize="icon"
                                />
                              </div>
                              <div className="flex justify-between items-end pt-1">
                                <div className="font-bold text-base text-foreground">
                                  {Number(cobranca.valor).toLocaleString(
                                    "pt-BR",
                                    {
                                      style: "currency",
                                      currency: "BRL",
                                    }
                                  )}
                                </div>
                                <span
                                  className={`px-2 py-0.5 inline-block rounded-full text-xs font-medium ${getStatusColor(
                                    cobranca.status,
                                    cobranca.data_vencimento
                                  )}`}
                                >
                                  {cobranca.status === CobrancaStatus.PAGO
                                    ? `Paga em ${formatDateToBR(
                                        cobranca.data_pagamento
                                      )}`
                                    : getStatusText(
                                        cobranca.status,
                                        cobranca.data_vencimento
                                      )}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {cobrancas.length > COBRANCAS_LIMIT && (
                          <div className="mt-4 text-center md:hidden">
                            <Button
                              variant="link"
                              className="text-primary"
                              onClick={() =>
                                setMostrarTodasCobrancas(!mostrarTodasCobrancas)
                              }
                            >
                              {mostrarTodasCobrancas
                                ? "Ver menos"
                                : `Ver todas as ${cobrancas.length} cobranças`}
                            </Button>
                          </div>
                        )}
                      </>
                    ) : (
                      <div>
                        {selectedPassageiro.ativo ? (
                          <>
                            <Alert className="bg-sky-50 border-sky-200 text-sky-900 p-3 md:p-4 rounded-xl gap-3 shadow-sm">
                              <Info className="h-5 w-5 text-sky-500 mt-0.5" />
                              <AlertTitle className="text-sky-900 text-sm font-semibold">
                                Nenhuma cobrança... ainda!
                              </AlertTitle>
                              <AlertDescription className="text-sky-800 text-sm leading-relaxed">
                                Não se preocupe! A primeira cobrança aparecerá
                                aqui <strong>no início do próximo mês</strong>,
                                com o vencimento para o dia programado.
                              </AlertDescription>
                            </Alert>
                          </>
                        ) : (
                          <Alert className="bg-red-50 text-red-900">
                            <AlertTriangle className="h-4 w-4 !text-red-900" />
                            <AlertTitle className="font-bold">
                              Cadastro desativado
                            </AlertTitle>
                            <AlertDescription className="text-red-800 text-sm leading-relaxed">
                              Ação realizada pelo condutor. Nenhuma cobrança
                              será gerada enquanto o cadastro estiver
                              desativado.
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Informações */}
              <div className="order-2 lg:order-1 lg:col-start-1 lg:row-start-1">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-4">
                    <div>
                      <CardTitle className="text-lg">
                        Informações do Cadastro
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <InfoItem icon={Contact} label="Responsável">
                      {selectedPassageiro.nome_responsavel}
                    </InfoItem>
                    <div className="block md:hidden">
                      <InfoItem icon={Contact} label="Situação">
                        <Badge
                          variant={
                            selectedPassageiro.ativo ? "outline" : "destructive"
                          }
                          className={
                            selectedPassageiro.ativo
                              ? "bg-green-600 text-white"
                              : ""
                          }
                        >
                          {selectedPassageiro.ativo ? "Ativo" : "Desativado"}
                        </Badge>
                      </InfoItem>
                    </div>
                    <InfoItem icon={School} label="Escola">
                      {selectedPassageiro.escola?.nome || "Não informada"}
                    </InfoItem>
                    <InfoItem icon={Car} label="Veículo">
                      {formatarPlacaExibicao(
                        selectedPassageiro.veiculos?.placa
                      ) || "Não informado"}
                    </InfoItem>
                    <InfoItem icon={MapPin} label="Endereço">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          {formatarEnderecoCompleto(selectedPassageiro)}
                        </span>
                      </div>
                    </InfoItem>
                    <InfoItem icon={MessageCircle} label="WhatsApp">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          {formatarTelefone(
                            selectedPassageiro.telefone_responsavel
                          )}
                        </span>
                      </div>
                    </InfoItem>

                    <InfoItem icon={Mail} label="E-mail">
                      {selectedPassageiro.email_responsavel || "Não informado"}
                    </InfoItem>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
      <LoadingOverlay active={refreshing} text="Aguarde..." />
    </>
  );
}
