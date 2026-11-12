import { TipoPerguntaPersonalizadaEnum } from "@/types/enums";

export { TipoPerguntaPersonalizadaEnum };

export interface PerguntaPersonalizadaConfig {
  id: string;
  pergunta: string;
  tipo: TipoPerguntaPersonalizadaEnum;
  placeholder_detalhe?: string | null;
  obrigatorio: boolean;
  ativo: boolean;
  is_padrao?: boolean;
}

export interface RespostaComplementarItem {
  id: string;
  pergunta: string;
  tipo: TipoPerguntaPersonalizadaEnum;
  resposta_booleana?: boolean | null;
  resposta_texto?: string | null;
}

export const DEFAULT_PERGUNTAS_PERSONALIZADAS: PerguntaPersonalizadaConfig[] = [
  {
    id: "saude_doenca",
    pergunta: "A criança possui ou já teve alguma doença ou condição médica?",
    tipo: TipoPerguntaPersonalizadaEnum.SIM_NAO_TEXTO,
    placeholder_detalhe: "Informe qual doença ou condição médica",
    obrigatorio: true,
    ativo: false,
    is_padrao: true,
  },
  {
    id: "saude_medicamento",
    pergunta: "Toma algum remédio regularmente?",
    tipo: TipoPerguntaPersonalizadaEnum.SIM_NAO_TEXTO,
    placeholder_detalhe: "Informe qual remédio e o horário",
    obrigatorio: true,
    ativo: false,
    is_padrao: true,
  },
  {
    id: "saude_alergia",
    pergunta: "Sofre de algum tipo de alergia (medicamento, alimento, etc.)?",
    tipo: TipoPerguntaPersonalizadaEnum.SIM_NAO_TEXTO,
    placeholder_detalhe: "Informe qual alergia e os cuidados necessários",
    obrigatorio: true,
    ativo: false,
    is_padrao: true,
  },
  {
    id: "saude_convenio",
    pergunta: "Possui convênio médico / plano de saúde?",
    tipo: TipoPerguntaPersonalizadaEnum.SIM_NAO_TEXTO,
    placeholder_detalhe: "Informe o nome do convênio e o nº do cartão",
    obrigatorio: true,
    ativo: false,
    is_padrao: true,
  },
  {
    id: "saude_tipo_sanguineo",
    pergunta: "Qual é o tipo sanguíneo e fator RH da criança?",
    tipo: TipoPerguntaPersonalizadaEnum.TEXTO_LIVRE,
    placeholder_detalhe: "Ex: O+, A-, Não sei informar",
    obrigatorio: false,
    ativo: false,
    is_padrao: true,
  },
  {
    id: "autorizado_receber",
    pergunta: "Se não tiver ninguém em casa, quem pode receber a criança?",
    tipo: TipoPerguntaPersonalizadaEnum.TEXTO_LIVRE,
    placeholder_detalhe: "Informe Nome, Parentesco e Telefone(s)",
    obrigatorio: true,
    ativo: false,
    is_padrao: true,
  },
];

export interface CamposFormularioExternoConfig {
  turma: boolean;
  data_nascimento: boolean;
  genero: boolean;
  periodo: boolean;
  modalidade: boolean;
  parentesco_responsavel: boolean;
  email_responsavel: boolean;
  perguntas_personalizadas?: PerguntaPersonalizadaConfig[];
}

export const DEFAULT_CAMPOS_FORMULARIO_EXTERNO: CamposFormularioExternoConfig = {
  turma: false,
  data_nascimento: true,
  genero: true,
  periodo: true,
  modalidade: true,
  parentesco_responsavel: true,
  email_responsavel: true,
  perguntas_personalizadas: DEFAULT_PERGUNTAS_PERSONALIZADAS,
};

export function resolvePerguntasPersonalizadas(
  rawPerguntas?: unknown
): PerguntaPersonalizadaConfig[] {
  if (!Array.isArray(rawPerguntas)) {
    return DEFAULT_PERGUNTAS_PERSONALIZADAS.map((item) => ({ ...item }));
  }

  const sanitizedList: PerguntaPersonalizadaConfig[] = [];
  const seenIds = new Set<string>();

  for (const raw of rawPerguntas) {
    if (!raw || typeof raw !== "object") continue;
    const item = raw as Record<string, unknown>;
    const id = typeof item.id === "string" ? item.id.trim() : "";
    const pergunta = typeof item.pergunta === "string" ? item.pergunta.trim() : "";
    if (!id || !pergunta || seenIds.has(id)) continue;

    const defaultMatch = DEFAULT_PERGUNTAS_PERSONALIZADAS.find((d) => d.id === id);
    const tipo =
      item.tipo === TipoPerguntaPersonalizadaEnum.TEXTO_LIVRE
        ? TipoPerguntaPersonalizadaEnum.TEXTO_LIVRE
        : TipoPerguntaPersonalizadaEnum.SIM_NAO_TEXTO;

    seenIds.add(id);
    sanitizedList.push({
      id,
      pergunta,
      tipo,
      placeholder_detalhe:
        typeof item.placeholder_detalhe === "string"
          ? item.placeholder_detalhe.trim()
          : (defaultMatch?.placeholder_detalhe ?? null),
      obrigatorio:
        typeof item.obrigatorio === "boolean"
          ? item.obrigatorio
          : (defaultMatch?.obrigatorio ?? true),
      ativo: Boolean(item.ativo),
      is_padrao: defaultMatch ? true : Boolean(item.is_padrao),
    });
  }

  for (const padrao of DEFAULT_PERGUNTAS_PERSONALIZADAS) {
    if (!seenIds.has(padrao.id)) {
      sanitizedList.push({ ...padrao });
    }
  }

  return sanitizedList;
}

export function resolveCamposFormularioExterno(
  rawConfig?: Partial<CamposFormularioExternoConfig> | null
): CamposFormularioExternoConfig {
  const obj = rawConfig && typeof rawConfig === "object" ? rawConfig : {};
  return {
    turma: typeof obj.turma === "boolean" ? obj.turma : DEFAULT_CAMPOS_FORMULARIO_EXTERNO.turma,
    data_nascimento:
      typeof obj.data_nascimento === "boolean"
        ? obj.data_nascimento
        : DEFAULT_CAMPOS_FORMULARIO_EXTERNO.data_nascimento,
    genero:
      typeof obj.genero === "boolean" ? obj.genero : DEFAULT_CAMPOS_FORMULARIO_EXTERNO.genero,
    periodo:
      typeof obj.periodo === "boolean" ? obj.periodo : DEFAULT_CAMPOS_FORMULARIO_EXTERNO.periodo,
    modalidade:
      typeof obj.modalidade === "boolean"
        ? obj.modalidade
        : DEFAULT_CAMPOS_FORMULARIO_EXTERNO.modalidade,
    parentesco_responsavel:
      typeof obj.parentesco_responsavel === "boolean"
        ? obj.parentesco_responsavel
        : DEFAULT_CAMPOS_FORMULARIO_EXTERNO.parentesco_responsavel,
    email_responsavel:
      typeof obj.email_responsavel === "boolean"
        ? obj.email_responsavel
        : DEFAULT_CAMPOS_FORMULARIO_EXTERNO.email_responsavel,
    perguntas_personalizadas: resolvePerguntasPersonalizadas(obj.perguntas_personalizadas),
  };
}

export function normalizeRespostasComplementares(
  rawList?: unknown
): RespostaComplementarItem[] {
  if (!Array.isArray(rawList)) return [];

  const result: RespostaComplementarItem[] = [];
  const seenIds = new Set<string>();

  for (const item of rawList) {
    if (!item || typeof item !== "object") continue;
    const raw = item as Record<string, unknown>;
    const id = typeof raw.id === "string" ? raw.id.trim() : "";
    const pergunta = typeof raw.pergunta === "string" ? raw.pergunta.trim() : "";
    if (!id || !pergunta || seenIds.has(id)) continue;

    const tipo =
      raw.tipo === TipoPerguntaPersonalizadaEnum.TEXTO_LIVRE
        ? TipoPerguntaPersonalizadaEnum.TEXTO_LIVRE
        : TipoPerguntaPersonalizadaEnum.SIM_NAO_TEXTO;

    const respostaBooleana =
      typeof raw.resposta_booleana === "boolean" ? raw.resposta_booleana : null;
    const textoLimpo =
      typeof raw.resposta_texto === "string" && raw.resposta_texto.trim() !== ""
        ? raw.resposta_texto.trim()
        : null;

    if (tipo === TipoPerguntaPersonalizadaEnum.SIM_NAO_TEXTO) {
      if (respostaBooleana === null) continue;
      seenIds.add(id);
      result.push({
        id,
        pergunta,
        tipo,
        resposta_booleana: respostaBooleana,
        resposta_texto: respostaBooleana ? textoLimpo : null,
      });
    } else {
      if (!textoLimpo) continue;
      seenIds.add(id);
      result.push({
        id,
        pergunta,
        tipo,
        resposta_booleana: null,
        resposta_texto: textoLimpo,
      });
    }
  }

  return result;
}

export function formatRespostaComplementarExibicao(
  item: RespostaComplementarItem
): string {
  if (item.tipo === TipoPerguntaPersonalizadaEnum.SIM_NAO_TEXTO) {
    if (item.resposta_booleana === true) {
      return item.resposta_texto ? `Sim — ${item.resposta_texto}` : "Sim";
    }
    return "Não";
  }
  return item.resposta_texto || "—";
}
