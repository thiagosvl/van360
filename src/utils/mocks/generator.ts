import {
  ParentescoResponsavel,
  PassageiroGenero,
  PassageiroModalidade,
  PassageiroPeriodo,
} from "@/types/enums";
import { CATEGORIAS_GASTOS } from "@/types/gasto";
import { addDays, getNowBR } from "@/utils/dateUtils";

// Listas de dados para geração aleatória
const nomes = [
  "Miguel", "Arthur", "Gael", "Théo", "Heitor", "Ravi", "Davi", "Bernardo", "Noah", "Gabriel",
  "Helena", "Alice", "Laura", "Maria Alice", "Sophia", "Manuela", "Maitê", "Liz", "Cecília", "Isabella",
  "Camila", "Carolina", "Juliana", "Mariana", "Fernanda", "Patrícia", "Renata", "Simone", "Viviane",
  "Amanda", "Aline", "Ana", "Beatriz", "Bianca", "Clara", "Daniela", "Debora", "Eliane", "Erica",
  "Fabiana", "Flavia", "Gabriela", "Giovanna", "Heloísa", "Igor", "Julia", "Larissa", "Letícia", "Lívia",
  "Luana", "Ludmila", "Luiza", "Madalena", "Marcela", "Mariane", "Marina", "Nathalia", "Pamela",
  "Priscila", "Raquel", "Sabrina", "Samantha", "Tatiane", "Thamiris", "Vanessa", "Vitória",

  // Masculinos adicionais
  "João", "Pedro", "Lucas", "Matheus", "Enzo", "Benjamin", "Samuel", "Lorenzo", "Enrico", "Levi",
  "Nicolas", "Guilherme", "Felipe", "Vinicius", "Caio", "Diego", "Bruno", "Eduardo", "Leonardo", "Murilo",
  "Muricy", "Otávio", "Henrique", "André", "Rafael", "Rodrigo", "Thiago", "William", "Yuri", "Vitor",
  "Alexandre", "Danilo", "Gustavo", "João Pedro", "João Miguel", "Isaac", "Antônio", "Cauã", "César", "Cristiano",

  // Femininos adicionais
  "Maria", "Maria Clara", "Maria Eduarda", "Maria Júlia", "Maria Luiza", "Valentina", "Emanuelly",
  "Yasmin", "Eloá", "Lorena", "Antonella", "Agatha", "Bruna", "Nicole", "Natália", "Melissa",
  "Esther", "Sarah", "Isadora", "Rebeca", "Elisa", "Eduarda", "Milena", "Rafaela", "Alicia",
  "Cristina", "Denise", "Elaine", "Franciele", "Gisele", "Ingrid", "Jaqueline", "Kelly",
  "Monique", "Rosana", "Silvia", "Teresa", "Verônica", "Yohana", "Zilda"
];

const sobrenomes = [
  "Silva", "Santos", "Oliveira", "Souza", "Rodrigues", "Ferreira", "Alves", "Pereira", "Lima", "Gomes",
  "Costa", "Ribeiro", "Martins", "Carvalho", "Almeida", "Lopes", "Soares", "Fernandes", "Vieira", "Barbosa",
  "Barreto", "Dias", "Rocha", "Mendes", "Nunes", "Costa", "Pinto", "Moura", "Albuquerque", "Rodrigues"
];

const ruas = [
  "Rua das Flores",
  "Avenida Paulista",
  "Rua Augusta",
  "Avenida Brasil",
  "Rua da Consolação",
  "Rua Oscar Freire",
  "Avenida Faria Lima",
  "Rua Haddock Lobo",
  "Rua Bela Cintra",
  "Alameda Santos",
  "Rua XV de Novembro",
  "Rua Sete de Setembro",
  "Rua Tiradentes",
  "Rua Dom Pedro II",
  "Rua Marechal Deodoro",
  "Rua Rui Barbosa",
  "Rua Castro Alves",
  "Rua José Bonifácio",
  "Rua Independência",
  "Rua das Acácias",
  "Rua das Palmeiras",
  "Rua dos Ipês",
  "Rua das Laranjeiras",
  "Rua São José",
  "Rua São João",
  "Avenida Central",
  "Avenida Independência",
  "Avenida das Nações",
  "Avenida das Américas",
  "Alameda Rio Branco"
];

const bairros = [
  "Centro", "Jardins", "Vila Madalena", "Pinheiros", "Moema", "Itaim Bibi", "Brooklin", "Vila Olímpia", "Perdizes", "Pompeia"
];

const cidades = [
  { nome: "São Paulo", estado: "SP" },
  { nome: "Rio de Janeiro", estado: "RJ" },
  { nome: "Belo Horizonte", estado: "MG" },
  { nome: "Curitiba", estado: "PR" },
  { nome: "Porto Alegre", estado: "RS" }
];

const escolas = [
  {
    nome: "Escola Vicente Garcia (zeferina)",
    cep: "04410-080",
    logradouro: "Rua das Flores",
    numero: "123",
    bairro: "Centro",
    cidade: "São Paulo",
    estado: "SP",
    referencia: "",
    complemento: "",
  },
  {
    nome: "Escola Municipal Menino Jesus De Praga",
    cep: "01310-100",
    logradouro: "Avenida Paulista",
    numero: "1578",
    bairro: "Bela Vista",
    cidade: "São Paulo",
    estado: "SP",
    referencia: "Próximo ao MASP",
    complemento: "Bloco A",
  },
  {
    nome: "Escola Confessional - Unidade Paulo Vi",
    cep: "01310-100",
    logradouro: "Avenida Paulista",
    numero: "1578",
    bairro: "Bela Vista",
    cidade: "São Paulo",
    estado: "SP",
    referencia: "Próximo ao MASP",
    complemento: "Bloco A",
  },
  {
    nome: "Eei Mundo De Zacarias",
    cep: "01310-100",
    logradouro: "Avenida Paulista",
    numero: "1578",
    bairro: "Bela Vista",
    cidade: "São Paulo",
    estado: "SP",
    referencia: "Próximo ao MASP",
    complemento: "Bloco A",
  },
];

const veiculos = [
  {
    placa: "ABC-1234",
    modelo: "Onix",
    marca: "Chevrolet",
  },
  {
    placa: "DEF-5678",
    modelo: "Gol",
    marca: "Volkswagen",
  },
  {
    placa: "GHI-9012",
    modelo: "HB20",
    marca: "Hyundai",
  },
  {
    placa: "JKL-3456",
    modelo: "Ka",
    marca: "Ford",
  },
  {
    placa: "MNO-7890",
    modelo: "Uno",
    marca: "Fiat",
  },
  {
    placa: "PQR-2468",
    modelo: "Argo",
    marca: "Fiat",
  },
  {
    placa: "STU-1357",
    modelo: "Cronos",
    marca: "Fiat",
  },
  {
    placa: "VWX-8642",
    modelo: "Corolla",
    marca: "Toyota",
  },
  {
    placa: "YZA-9753",
    modelo: "Yaris",
    marca: "Toyota",
  },
  {
    placa: "BCD-4826",
    modelo: "Civic",
    marca: "Honda",
  },
  {
    placa: "EFG-7195",
    modelo: "Fit",
    marca: "Honda",
  },
  {
    placa: "HIJ-3061",
    modelo: "Sandero",
    marca: "Renault",
  },
  {
    placa: "KLM-5284",
    modelo: "Logan",
    marca: "Renault",
  },
  {
    placa: "NOP-1478",
    modelo: "Polo",
    marca: "Volkswagen",
  },
  {
    placa: "QRS-9630",
    modelo: "Virtus",
    marca: "Volkswagen",
  },
  {
    placa: "TUV-8521",
    modelo: "Tracker",
    marca: "Chevrolet",
  },
  {
    placa: "WXY-6743",
    modelo: "Creta",
    marca: "Hyundai",
  },
  {
    placa: "ZAB-2187",
    modelo: "Compass",
    marca: "Jeep",
  },
  {
    placa: "CDE-5591",
    modelo: "Pulse",
    marca: "Fiat",
  },
  {
    placa: "FGH-8802",
    modelo: "Kwid",
    marca: "Renault",
  }
];

/**
 * Gera um número aleatório entre min e max (inclusivo)
 */
const randomNumber = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

const randomEnum = <T>(anEnum: T): T[keyof T] => {
  const enumValues = Object.values(anEnum as object) as unknown as T[keyof T][];
  const randomIndex = Math.floor(Math.random() * enumValues.length);
  return enumValues[randomIndex];
};

function generateUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const generateDate = (startYear: number, endYear: number) => {
  const year = randomNumber(startYear, endYear);
  const month = randomNumber(1, 12).toString().padStart(2, '0');
  const day = randomNumber(1, 28).toString().padStart(2, '0');
  return `${day}/${month}/${year}`;
};

/**
 * Gera um dígito verificador de CPF
 */
const createCPFDigit = (cpfPartial: string) => {
  let sum = 0;
  let weight = cpfPartial.length + 1;

  for (let i = 0; i < cpfPartial.length; i++) {
    sum += parseInt(cpfPartial[i]) * weight--;
  }

  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
};

/**
 * Gera um CPF válido formatado ou não
 */
export const generateCPF = (formatted = true): string => {
  const n1 = randomNumber(0, 9);
  const n2 = randomNumber(0, 9);
  const n3 = randomNumber(0, 9);
  const n4 = randomNumber(0, 9);
  const n5 = randomNumber(0, 9);
  const n6 = randomNumber(0, 9);
  const n7 = randomNumber(0, 9);
  const n8 = randomNumber(0, 9);
  const n9 = randomNumber(0, 9);

  let cpf = `${n1}${n2}${n3}${n4}${n5}${n6}${n7}${n8}${n9}`;

  const d1 = createCPFDigit(cpf);
  cpf += d1;

  const d2 = createCPFDigit(cpf);
  cpf += d2;

  if (formatted) {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }
  return cpf;
};

/**
 * Gera um nome completo aleatório
 */
export const generateName = (): string => {
  const nome = nomes[randomNumber(0, nomes.length - 1)];
  const sobrenome1 = sobrenomes[randomNumber(0, sobrenomes.length - 1)];
  const sobrenome2 = sobrenomes[randomNumber(0, sobrenomes.length - 1)];
  return `${nome} ${sobrenome1} ${sobrenome2}`;
};

export const generatePhone = (variant?: number): string => {
  if (variant !== undefined) {
    return `(11) 95118-695${variant % 10}`;
  }
  const lastDigit = randomNumber(1, 9);
  return `(11) 95118-695${lastDigit}`;
};

/**
 * Gera um email aleatório baseado no nome
 */
export const generateEmail = (name: string): string => {
  const cleanName = name.toLowerCase().replace(/\s+/g, ".").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const domains = ["gmail.com", "hotmail.com", "outlook.com", "uol.com.br", "bol.com.br"];
  const domain = domains[randomNumber(0, domains.length - 1)];
  return `${cleanName}${randomNumber(1, 99)}@${domain}`;
};

/**
 * Gera um CEP aleatório formatado
 */
export const generateCEP = (): string => {
  const part1 = randomNumber(10000, 99999);
  const part2 = randomNumber(100, 999);
  return `${part1}-${part2}`;
};

/**
 * Gera um endereço completo aleatório
 */
export const generateAddress = () => {
  const cidade = cidades[randomNumber(0, cidades.length - 1)];
  return {
    cep: generateCEP(),
    logradouro: ruas[randomNumber(0, ruas.length - 1)],
    numero: randomNumber(1, 9999).toString(),
    complemento: Math.random() > 0.5 ? `Apto ${randomNumber(1, 100)}` : "",
    bairro: bairros[randomNumber(0, bairros.length - 1)],
    cidade: cidade.nome,
    estado: cidade.estado,
    referencia: "referencia teste",
  };
};

export const generatePeriodo = (): PassageiroPeriodo => {
  return randomEnum(PassageiroPeriodo);
};

export const generateTurma = (): string => {
  const turmas = ["1º ano", "2º ano", "3º ano", "4º ano", "5º ano", "6º ano", "7º ano", "8º ano", "9º ano"];
  return turmas[randomNumber(0, turmas.length - 1)];
};


export const generateProfessor = (): string => {
  return "Claudia";
};

/**
 * Gera um dia de vencimento aleatório (comum)
 */
export const generateVencimento = (): string => {
  const dias = ["5", "10", "15", "20"];
  const dia = dias[randomNumber(0, dias.length - 1)];

  return dia;
};

/**
 * Gera um valor de parcela aleatório formatado
 */
export const generateValorCobranca = (): string => {
  const valores = ["150,00", "180,00", "200,00", "220,00", "250,00"];
  return valores[randomNumber(0, valores.length - 1)];
};

export const mockGenerator = {
  cpf: generateCPF,
  name: generateName,
  email: generateEmail,
  phone: generatePhone,
  cep: generateCEP,
  address: generateAddress,
  escola: () => {
    const escolaBase = escolas[randomNumber(0, escolas.length - 1)];
    // Add random suffix to avoid duplicates
    const suffix = randomNumber(1, 999);
    return {
      ...escolaBase,
      nome: `${escolaBase.nome} ${suffix}`,
      ativo: true,
    };
  },
  veiculo: () => {
    const veiculoBase = veiculos[randomNumber(0, veiculos.length - 1)];
    // Generate unique placa
    const letters = ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K", "L", "M", "N", "P", "Q", "R", "S", "T", "U", "V", "X", "Z"];
    const randomLetter = () => letters[randomNumber(0, letters.length - 1)];
    const placa = `${randomLetter()}${randomLetter()}${randomLetter()}-${randomNumber(1, 9)}${randomLetter()}${randomNumber(1, 9)}${randomNumber(1, 9)}`;
    return {
      placa,
      marca: veiculoBase.marca,
      modelo: veiculoBase.modelo,
      ativo: true,
    };
  },
  gasto: (overrides?: { veiculo_id?: string }) => {
    const descricoes = [
      "Abastecimento semanal",
      "Troca de óleo",
      "Lavagem completa",
      "Revisão preventiva",
      "Conserto de pneu",
      "Taxa de vistoria",
      "Seguro mensal",
      "Limpeza interna",
    ];
    const valor = randomNumber(50, 500);
    const hoje = getNowBR();
    const diasAtras = randomNumber(0, 30);
    const data = addDays(hoje, -diasAtras);

    return {
      valor: `R$ ${valor},00`,
      data,
      categoria: CATEGORIAS_GASTOS[randomNumber(0, CATEGORIAS_GASTOS.length - 1)],
      descricao: descricoes[randomNumber(0, descricoes.length - 1)],
      veiculo_id: overrides?.veiculo_id || "none",
      ...overrides,
    };
  },
  passenger: (overrides?: Record<string, unknown>) => {
    const name = generateName();
    const address = generateAddress();
    return {
      nome: name,
      periodo: generatePeriodo(),
      responsavel_principal: {
        id: generateUUID(),
        nome: generateName(),
        telefone: "(11) 95118-6951",
        cpf: generateCPF(),
        email: "thiago-svl@hotmail.com",
        parentesco: randomEnum(ParentescoResponsavel),
        ...address,
      },
      valor_cobranca: generateValorCobranca(),
      dia_vencimento: generateVencimento(),
      ativo: true,
      observacoes: "é um teste",

      // New fields from Schema/Enums
      turma: generateTurma(),
      nome_professor: generateProfessor(),
      genero: randomEnum(PassageiroGenero),
      modalidade: randomEnum(PassageiroModalidade),
      data_nascimento: generateDate(2010, 2020), // 4-14 years old
      data_inicio_transporte: generateDate(2024, 2026),
      data_fim_transporte: generateDate(2024, 2026),
      mes_inicio_cobranca: "1",
      mes_fim_cobranca: "12",

      ...overrides
    };
  },
  rota: () => {
    const nomesRotas = [
      "Rota das Escolas Municipais",
      "Rota Sul Integrada",
      "Rota Escolar Tarde",
      "Rota Centro-Norte",
      "Escolas Estaduais",
      "Colégio Objetivo"
    ];

    const nomeBase = nomesRotas[randomNumber(0, nomesRotas.length - 1)];

    return {
      nome: `${nomeBase}`
    };
  }
};
