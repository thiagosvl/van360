import { memo, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Banner } from "@/components/ui/Banner";
import {
  CamposFormularioExternoConfig,
  DEFAULT_CAMPOS_FORMULARIO_EXTERNO,
} from "@/constants/formularioExterno";
import { ConfiguracoesUsuario, UpdateConfiguracoesInput } from "@/hooks/api/useConfiguracoes";
import { FileEdit, RotateCcw } from "lucide-react";
import { toast } from "sonner";

interface FormularioExternoPreferenciasCardProps {
  configuracoes?: ConfiguracoesUsuario;
  updateConfiguracoes: (payload: UpdateConfiguracoesInput) => Promise<ConfiguracoesUsuario>;
  isUpdating: boolean;
}

interface ItemConfig {
  key: keyof CamposFormularioExternoConfig;
  title: string;
  description: string;
}

const ITENS_FORMULARIO: ItemConfig[] = [
  {
    key: "turma",
    title: "Turma do Aluno",
    description: "Exige que o responsável informe a turma escolar (ex: 5º Ano) para concluir o envio.",
  },
  {
    key: "data_nascimento",
    title: "Data de Nascimento do Aluno",
    description: "Exige a data de nascimento do passageiro para cálculo de idade e alertas de aniversariantes.",
  },
  {
    key: "genero",
    title: "Gênero do Aluno",
    description: "Exige a seleção de gênero (Masculino ou Feminino) no cadastro do aluno.",
  },
  {
    key: "periodo",
    title: "Período / Turno",
    description: "Exige a seleção do turno escolar (Manhã, Tarde, Integral ou Noite) para a rota.",
  },
  {
    key: "modalidade",
    title: "Modalidade do Transporte",
    description: "Exige definir o trajeto contratado: Ida e Volta, Apenas Ida ou Apenas Volta.",
  },
  {
    key: "parentesco_responsavel",
    title: "Grau de Parentesco do Responsável",
    description: "Exige informar o vínculo familiar (Mãe, Pai, Avô/Avó, etc.) com o passageiro.",
  },
  {
    key: "email_responsavel",
    title: "E-mail do Responsável",
    description: "Exige o preenchimento de um endereço de e-mail de contato válido do responsável.",
  },
];

export const FormularioExternoPreferenciasCard = memo(
  function FormularioExternoPreferenciasCard({
    configuracoes,
    updateConfiguracoes,
    isUpdating,
  }: FormularioExternoPreferenciasCardProps) {
    const [updatingKey, setUpdatingKey] = useState<string | null>(null);

    const camposAtuais: CamposFormularioExternoConfig = {
      ...DEFAULT_CAMPOS_FORMULARIO_EXTERNO,
      ...(configuracoes?.campos_formulario_externo || {}),
    };

    const isBusy = isUpdating || updatingKey !== null;

    const handleToggleField = async (
      key: keyof CamposFormularioExternoConfig,
      currentValue: boolean
    ) => {
      if (isBusy) return;
      setUpdatingKey(key);
      try {
        const novosCampos: CamposFormularioExternoConfig = {
          ...camposAtuais,
          [key]: !currentValue,
        };
        await updateConfiguracoes({ campos_formulario_externo: novosCampos });
        toast.success(
          !currentValue
            ? "Campo definido como obrigatório no formulário externo!"
            : "Campo definido como opcional no formulário externo!"
        );
      } catch {
      } finally {
        setUpdatingKey(null);
      }
    };

    const handleRestaurarPadrao = async () => {
      if (isBusy) return;
      setUpdatingKey("reset_padrao");
      try {
        await updateConfiguracoes({
          campos_formulario_externo: DEFAULT_CAMPOS_FORMULARIO_EXTERNO,
        });
        toast.success("Campos do formulário externo restaurados para o padrão!");
      } catch {
      } finally {
        setUpdatingKey(null);
      }
    };

    return (
      <div className="bg-white rounded-[24px] border border-[#e5e5e5] p-5 sm:p-6 shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[#e5e5e5] pb-4 gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-[14px] bg-[#f5f5f5] text-[#0a0a0a] flex items-center justify-center shrink-0 border border-[#e5e5e5]">
              <FileEdit className="w-5 h-5 text-[#0a0a0a]" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#0a0a0a] tracking-tight">
                Formulário de Solicitações de Cadastro
              </h2>
              <p className="text-xs text-[#737373] mt-0.5">
                Defina quais informações são obrigatórias para os responsáveis ao preencherem o cadastro online.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRestaurarPadrao}
            disabled={isBusy}
            className="self-start sm:self-auto text-xs font-semibold text-[#1a3a5c] hover:bg-slate-100 disabled:opacity-50 px-3 py-1.5 rounded-xl border border-slate-200 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
            title="Restaurar a configuração padrão"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restaurar Padrão
          </button>
        </div>

        <Banner
          variant="info"
          description="Nome do Aluno, Ano Letivo, Nome e CPF do Responsável, Telefone e Endereço Residencial são mantidos sempre obrigatórios para garantir a segurança e integridade do cadastro."
        />

        <div className="divide-y divide-[#e5e5e5] space-y-4 pt-1">
          {ITENS_FORMULARIO.map((item, index) => {
            const isObrigatorio = camposAtuais[item.key];
            const isCurrentUpdating = updatingKey === item.key;

            return (
              <div
                key={item.key}
                className={`flex items-center justify-between gap-4 pt-4 ${index === 0 ? "pt-1 first:pt-0" : ""
                  }`}
              >
                <div className="space-y-0.5 min-w-0 pr-1">
                  <h3 className="text-sm font-medium text-[#0a0a0a] leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#737373] leading-relaxed mt-0.5">
                    {item.description}
                  </p>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-500 hidden sm:inline">
                    {isObrigatorio ? "Obrigatório" : "Opcional"}
                  </span>
                  <Switch
                    id={`switch-campo-${item.key}`}
                    checked={isObrigatorio}
                    loading={isCurrentUpdating}
                    onCheckedChange={() => handleToggleField(item.key, isObrigatorio)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);
