export interface ContractSection {
  id: string;
  titulo: string;
  clausulas: string[];
}

export const DEFAULT_SECOES_CONTRATO: ContractSection[] = [
  {
    id: "secao-objeto",
    titulo: "DO OBJETO",
    clausulas: [
      "O CONTRATADO compromete-se a prestar serviço de transporte escolar em veículo devidamente autorizado pelos órgãos competentes do DF e equipado com os itens obrigatórios de segurança, seguindo estritamente o calendário escolar oficial."
    ]
  },
  {
    id: "secao-prestacao",
    titulo: "DA PRESTAÇÃO DO SERVIÇO",
    clausulas: [
      "O transporte será realizado de segunda a sexta-feira. NÃO ATENDEMOS AOS SÁBADOS (reservado para manutenção dos veículos), domingos, feriados, recessos escolares, períodos de recuperação final ou reposição de aula. Não fazemos transporte em horários contrários, passeios ou festas escolares.",
      "Somente o passageiro CONTRATANTE está autorizado a utilizar o transporte, sendo vedado o acompanhamento de terceiros. É obrigação do responsável manter o aluno no local e horário combinados no embarque e desembarque, não sendo possível o veículo aguardar para evitar atrasos na rota.",
      "Fica estabelecido que, em caso de mudança no local de origem, destino ou retorno, a CONTRATADA reserva-se o direito de aceitar ou não as alterações devido à modificação de rota, podendo desobrigar-se da prestação do serviço."
    ]
  },
  {
    id: "secao-valor",
    titulo: "DO VALOR",
    clausulas: [
      "A CONTRATANTE pagará o valor mensal acordado na forma e prazo estipulados. As parcelas mensais deverão ser quitadas normalmente mesmo durante os períodos de férias (julho, dezembro e janeiro), recessos, greves ou faltas do aluno.",
      "CASO O PAGAMENTO NÃO SEJA EFETUADO ATÉ O DIA 20 DO MÊS CORRENTE, O TRANSPORTE ESCOLAR SERÁ SUSPENSO até que o débito seja regularizado, não implicando o fato em quebra de contrato por parte da CONTRATADA."
    ]
  },
  {
    id: "secao-rescisao",
    titulo: "DA RESCISÃO",
    clausulas: [
      "O atraso no pagamento da parcela por 30 (trinta) dias ou mais sujeitará o contrato a rescisão e cobrança judicial/extrajudicial, podendo o nome do responsável ser encaminhado aos órgãos de proteção ao crédito (SPC/Serasa) e protestado em cartório.",
      "Fica o CONTRATADO autorizado a realizar reajuste suplementar sobre o valor das parcelas não vencidas quando ocorrer majoração nos custos operacionais que repercutam diretamente no transporte.",
      "Este contrato poderá ser rescindido por qualquer das partes mediante comunicação com antecedência mínima de 30 (trinta) dias, exceto nos meses de junho e novembro. A ausência do aviso prévio sujeitará a parte que rescindir a multa de 01 (uma) parcela em vigor."
    ]
  },
  {
    id: "secao-gerais",
    titulo: "DAS DISPOSIÇÕES GERAIS",
    clausulas: [
      "O passageiro que se portar com desrespeito ou indisciplina para com o motorista, auxiliar ou demais usuários, ou causar danos ao veículo, poderá ser suspenso ou desligado do transporte, respondendo o responsável legal pelos custos dos danos materiais.",
      "Está proibido o consumo de alimentos no interior do veículo escolar com a finalidade de prevenir acidentes (engasgos), desentendimentos e manter a limpeza do veículo.",
      "A CONTRATADA não se responsabilizará por objetos de valor, materiais escolares, pertences ou dinheiro eventualmente esquecidos ou trocados no interior do veículo.",
      "Para dirimir quaisquer dúvidas oriundas deste instrumento, fica eleito o foro de Brasília-DF, reconhecendo as partes o presente contrato como título executivo extrajudicial."
    ]
  }
];

export const DEFAULT_CLAUSULAS_CONTRATO = DEFAULT_SECOES_CONTRATO.flatMap((s) => s.clausulas);

export const ESTADOS_BRASILEIROS = [
  { value: "AC", label: "Acre" },
  { value: "AL", label: "Alagoas" },
  { value: "AP", label: "Amapá" },
  { value: "AM", label: "Amazonas" },
  { value: "BA", label: "Bahia" },
  { value: "CE", label: "Ceará" },
  { value: "DF", label: "Distrito Federal" },
  { value: "ES", label: "Espírito Santo" },
  { value: "GO", label: "Goiás" },
  { value: "MA", label: "Maranhão" },
  { value: "MT", label: "Mato Grosso" },
  { value: "MS", label: "Mato Grosso do Sul" },
  { value: "MG", label: "Minas Gerais" },
  { value: "PA", label: "Pará" },
  { value: "PB", label: "Paraíba" },
  { value: "PR", label: "Paraná" },
  { value: "PE", label: "Pernambuco" },
  { value: "PI", label: "Piauí" },
  { value: "RJ", label: "Rio de Janeiro" },
  { value: "RN", label: "Rio Grande do Norte" },
  { value: "RS", label: "Rio Grande do Sul" },
  { value: "RO", label: "Rondônia" },
  { value: "RR", label: "Roraima" },
  { value: "SC", label: "Santa Catarina" },
  { value: "SP", label: "São Paulo" },
  { value: "SE", label: "Sergipe" },
  { value: "TO", label: "Tocantins" },
];
