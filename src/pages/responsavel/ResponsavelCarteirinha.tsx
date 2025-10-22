import { LoadingOverlay } from "@/components/LoadingOverlay";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { disableExcluirCobranca } from "@/utils/disableActions";

import { AlertTriangle, Info, MoreVertical } from "lucide-react";
import React from "react";

import AppNavbarResponsavel from "@/components/responsavel/AppNavbarResponsavel";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { PullToRefreshWrapper } from "@/hooks/PullToRefreshWrapper";
import { supabase } from "@/integrations/supabase/client";
import { cobrancaService } from "@/services/cobrancaService";
import { responsavelService } from "@/services/responsavelService";
import {
  formatarEnderecoCompleto,
  formatarTelefone,
  formatDateToBR,
  getMesNome,
  getStatusColor,
  getStatusText,
} from "@/utils/formatters";
import { formatarPlacaExibicao } from "@/utils/placaUtils";
import {
  BellOff,
  Car,
  Contact,
  Mail,
  MapPin,
  MessageCircle,
  School,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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
  const [anos, setAnos] = useState<number[]>([]);
  const [refreshing, setRefreshing] = useState(true);
  const [anoSelecionado, setAnoSelecionado] = useState<number | null>(null);
  const [cobrancas, setCobrancas] = useState<any[]>([]);
  const [mostrarTodasCobrancas, setMostrarTodasCobrancas] = useState(false);
  const { toast } = useToast();

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

  const pullToRefreshReload = async () => {
    carregar();
  };

  const carregar = async () => {
    try {
      if (!cpf || !email) {
        navigate("/login");
        return;
      }

      setRefreshing(true);
      const lista = await responsavelService.loginPorCpfEmail(cpf!, email!);
      if (!lista || lista.length === 0) {
        toast({
          title: "Nenhum passageiro encontrado",
          variant: "destructive",
        });
        return;
      }

      setPassageiros(lista);

      if (lista.length > 1 && !passageiroIdStorage) {
        navigate("/responsavel/selecionar", {
          state: { passageiros: lista },
        });
        return;
      }

      const atual = lista.find((p) => p.id === passageiroIdStorage) || lista[0];
      setSelectedPassageiro(atual);
      localStorage.setItem("responsavel_id", atual.id);

      const anosBrutos = await cobrancaService.fetchAvailableYears(atual.id);

      const anosAgrupados = Array.from(
        new Set((anosBrutos || []).map((a: any) => Number(a)))
      ).sort((a, b) => b - a);

      setAnos(anosAgrupados);
      setAnoSelecionado(anosAgrupados[0] || null);

      const { data, error } = await supabase
        .from("cobrancas")
        .select(`*, passageiros:passageiro_id (nome, nome_responsavel)`)
        .eq("passageiro_id", atual.id)
        .eq("usuario_id", localStorage.getItem("responsavel_usuario_id"))
        .eq("ano", anosAgrupados?.[0])
        .order("mes", { ascending: false });

      if (error) console.error("Erro ao buscar cobranças:", error);
      setCobrancas(data || []);
    } catch (err) {
      console.error("Erro ao carregar informações:", err);
      toast({
        title: "Erro ao carregar informações",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
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

      const anosDisponiveis = await cobrancaService.fetchAvailableYears(p.id);
      setAnos(anosDisponiveis || []);
      setAnoSelecionado(anosDisponiveis?.[0] || null);

      const { data, error } = await supabase
        .from("cobrancas")
        .select(`*, passageiros:passageiro_id (nome, nome_responsavel)`)
        .eq("passageiro_id", p.id)
        .eq("usuario_id", localStorage.getItem("responsavel_usuario_id"))
        .eq("ano", anosDisponiveis?.[0])
        .order("mes", { ascending: false });
      setCobrancas(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao buscar alterar passageiro.",
        description: error.message || "Não foi possível concluir a operação.",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleChangeAno = async (ano: number) => {
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
  };

  if (refreshing || !selectedPassageiro) {
    return (
      <>
        <div className="min-h-screen flex flex-col">
          <AppNavbarResponsavel
            nomePassageiro={selectedPassageiro?.nome}
            anoSelecionado={anoSelecionado}
          />
        </div>
        <LoadingOverlay active text="Aguarde..." />
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen w-full bg-background">
        <div className="flex h-screen">
          <div className="flex-1 flex flex-col">
            <AppNavbarResponsavel
              nomePassageiro={selectedPassageiro?.nome}
              anoSelecionado={anoSelecionado}
            />
            <main className="flex-1 overflow-y-auto p-4 md:p-6">
              {passageiros.length > 1 && (
                <div className="w-full md:w-1/3 mx-auto mt-4 md:mt-6 mb-6">
                  <Select
                    onValueChange={(v) => handleChangePassageiro(v)}
                    defaultValue={selectedPassageiro.id}
                  >
                    <SelectTrigger className="w-full md:w-[250px] mx-auto">
                      <SelectValue placeholder="Selecione o passageiro" />
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
              )}
              <PullToRefreshWrapper onRefresh={pullToRefreshReload}>
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
                                onValueChange={(v) =>
                                  handleChangeAno(Number(v))
                                }
                              >
                                <SelectTrigger className="w-[100px] text-sm">
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
                                      <tr
                                        key={cobranca.id}
                                        className="hover:bg-muted/50 cursor-pointer"
                                      >
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
                                            {cobranca.status === "pago"
                                              ? ` em ${formatDateToBR(
                                                  cobranca.data_pagamento
                                                )} `
                                              : ""}
                                          </span>
                                          {cobranca.desativar_lembretes &&
                                            cobranca.status !== "pago" && (
                                              <div className="text-xs text-yellow-800 mt-2 flex items-center gap-1">
                                                <BellOff className="w-3 h-3" />
                                                <span className="truncate">
                                                  Notificações automáticas
                                                  suspensas
                                                </span>
                                              </div>
                                            )}
                                        </td>
                                        <td className="p-4 align-top">
                                          {cobranca.valor.toLocaleString(
                                            "pt-BR",
                                            {
                                              style: "currency",
                                              currency: "BRL",
                                            }
                                          )}
                                        </td>
                                        <td className="p-4 align-top">
                                          {formatDateToBR(
                                            cobranca.data_vencimento
                                          )}
                                        </td>
                                        <td className="p-4 text-center align-top">
                                          <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0"
                                                onClick={(e) =>
                                                  e.stopPropagation()
                                                }
                                              >
                                                <MoreVertical className="h-4 w-4" />
                                              </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                              <DropdownMenuItem
                                                className="cursor-pointer"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                }}
                                              >
                                                ???
                                              </DropdownMenuItem>
                                            </DropdownMenuContent>
                                          </DropdownMenu>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                              <div className="md:hidden -mx-6 -mt-6 divide-y divide-gray-100">
                                {cobrancasParaExibir.map((cobranca) => (
                                  <div
                                    key={cobranca.id}
                                    className="py-2.5 px-3 active:bg-muted/50"
                                  >
                                    {/* O conteúdo do item da lista (cobranca) permanece o mesmo */}
                                    <div className="flex justify-between items-start">
                                      <div className="flex flex-col pr-1 w-2/3">
                                        <div className="font-semibold text-gray-800 text-sm overflow-hidden text-ellipsis whitespace-nowrap">
                                          {getMesNome(cobranca.mes)}
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-0.5 overflow-hidden text-ellipsis whitespace-nowrap">
                                          Vencimento:{" "}
                                          <span className="font-medium text-gray-700">
                                            {formatDateToBR(
                                              cobranca.data_vencimento
                                            )}
                                          </span>
                                        </div>
                                      </div>
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 shrink-0 -mr-2 -mt-1"
                                            onClick={(e) => e.stopPropagation()}
                                          >
                                            <MoreVertical className="h-4 w-4" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                          <DropdownMenuItem
                                            disabled={disableExcluirCobranca(
                                              cobranca
                                            )}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                            }}
                                          >
                                            ???
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
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
                                        {cobranca.status === "pago"
                                          ? `Paga em ${formatDateToBR(
                                              cobranca.data_pagamento
                                            )}`
                                          : getStatusText(
                                              cobranca.status,
                                              cobranca.data_vencimento
                                            )}
                                      </span>
                                    </div>
                                    {cobranca.desativar_lembretes &&
                                      cobranca.status !== "pago" && (
                                        <div className="mt-2 flex items-center gap-2 text-xs p-1 rounded-md bg-yellow-50 text-yellow-800 border border-yellow-200">
                                          <BellOff className="h-4 w-4 shrink-0" />
                                          <span className="truncate">
                                            Notificações automáticas suspensas
                                          </span>
                                        </div>
                                      )}
                                  </div>
                                ))}
                              </div>

                              {cobrancas.length > COBRANCAS_LIMIT && (
                                <div className="mt-4 text-center md:hidden">
                                  <Button
                                    variant="link"
                                    className="text-primary"
                                    onClick={() =>
                                      setMostrarTodasCobrancas(
                                        !mostrarTodasCobrancas
                                      )
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
                                      Não se preocupe! A primeira cobrança
                                      aparecerá aqui{" "}
                                      <strong>no início do próximo mês</strong>,
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
                                  <AlertDescription className="space-y-3">
                                    <p>
                                      O sistema não irá gerar novas cobranças
                                      enquanto o passageiro estiver desativado.
                                    </p>
                                    <p>
                                      Para voltar a gerar cobranças, é
                                      necessário reativar o cadastro.
                                    </p>
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
                              {selectedPassageiro.nome}
                            </CardTitle>
                            <CardDescription className="text-xs">
                              {selectedPassageiro.nome_responsavel}
                            </CardDescription>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <InfoItem icon={Contact} label="Situação">
                            <Badge
                              variant={
                                selectedPassageiro.ativo
                                  ? "outline"
                                  : "destructive"
                              }
                              className={
                                selectedPassageiro.ativo
                                  ? "bg-green-600 text-white"
                                  : ""
                              }
                            >
                              {selectedPassageiro.ativo
                                ? "Ativo"
                                : "Desativado"}
                            </Badge>
                          </InfoItem>
                          <InfoItem icon={School} label="Escola">
                            {selectedPassageiro.escolas?.nome ||
                              "Não informada"}
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
                          <InfoItem
                            icon={MessageCircle}
                            label="Telefone (WhatsApp)"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-sm">
                                {formatarTelefone(
                                  selectedPassageiro.telefone_responsavel
                                )}
                              </span>
                            </div>
                          </InfoItem>

                          <InfoItem icon={Mail} label="E-mail">
                            {selectedPassageiro.email_responsavel ||
                              "Não informado"}
                          </InfoItem>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </PullToRefreshWrapper>
            </main>
          </div>
        </div>
      </div>
      <LoadingOverlay active={refreshing} text="Aguarde..." />
    </>
  );
}
