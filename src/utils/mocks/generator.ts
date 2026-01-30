import {
  ParentescoResponsavel,
  PassageiroGenero,
  PassageiroModalidade,
} from "@/types/enums";
import { CATEGORIAS_GASTOS } from "@/types/gasto";

// Listas de dados para geração aleatória
const nomes = [
  "Miguel", "Arthur", "Gael", "Théo", "Heitor", "Ravi", "Davi", "Bernardo", "Noah", "Gabriel",
  "Helena", "Alice", "Laura", "Maria Alice", "Sophia", "Manuela", "Maitê", "Liz", "Cecília", "Isabella"
];

const sobrenomes = [
  "Silva", "Santos", "Oliveira", "Souza", "Rodrigues", "Ferreira", "Alves", "Pereira", "Lima", "Gomes",
  "Costa", "Ribeiro", "Martins", "Carvalho", "Almeida", "Lopes", "Soares", "Fernandes", "Vieira", "Barbosa"
];

const ruas = [
  "Rua das Flores", "Avenida Paulista", "Rua Augusta", "Avenida Brasil", "Rua da Consolação",
  "Rua Oscar Freire", "Avenida Faria Lima", "Rua Haddock Lobo", "Rua Bela Cintra", "Alameda Santos"
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
    nome: "Ibrahim Nobre",
    cep: "04410-080",
    logradouro: "Rua das Flores",
    numero: "123",
    bairro: "Centro",
    cidade: "São Paulo",
    estado: "SP",
    referencia: "",
  },
  {
    nome: "Joanna Abraão",
    cep: "01310-100",
    logradouro: "Avenida Paulista",
    numero: "1578",
    bairro: "Bela Vista",
    cidade: "São Paulo",
    estado: "SP",
    referencia: "Próximo ao MASP",
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
 * Gera um telefone celular aleatório formatado
 */
export const generatePhone = (): string => {
  return "(11) 95118-6951";
  const ddd = randomNumber(11, 99);
  const part1 = randomNumber(90000, 99999);
  const part2 = randomNumber(1000, 9999);
  return `(${ddd}) ${part1}-${part2}`;
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

/**
 * Gera um período aleatório
 */
export const generatePeriodo = (): string => {
  const periodos = ["manha", "tarde", "noite", "integral"];
  return periodos[randomNumber(0, periodos.length - 1)];
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
 * Gera um valor de mensalidade aleatório formatado
 */
export const generateValorCobranca = (): string => {
  const valores = ["150,00", "250,00", "350,00", "450,00", "550,00"];
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
    const hoje = new Date();
    const diasAtras = randomNumber(0, 30);
    const data = new Date(hoje.getTime() - diasAtras * 24 * 60 * 60 * 1000);
    
    return {
      valor: `R$ ${valor},00`,
      data,
      categoria: CATEGORIAS_GASTOS[randomNumber(0, CATEGORIAS_GASTOS.length - 1)],
      descricao: descricoes[randomNumber(0, descricoes.length - 1)],
      veiculo_id: overrides?.veiculo_id || "none",
      ...overrides,
    };
  },
  passenger: (overrides?: any) => {
    const name = generateName();
    const address = generateAddress();
    return {
      nome: name,
      periodo: generatePeriodo(),
      nome_responsavel: generateName(),
      email_responsavel: generateEmail(name),
      cpf_responsavel: generateCPF(),
      telefone_responsavel: generatePhone(),
      valor_cobranca: generateValorCobranca(),
      dia_vencimento: generateVencimento(),
      ...address,
      ativo: true,
      observacoes: "é um teste",
      enviar_cobranca_automatica: false,
      
      // New fields from Schema/Enums
      genero: randomEnum(PassageiroGenero),
      modalidade: randomEnum(PassageiroModalidade),
      parentesco_responsavel: randomEnum(ParentescoResponsavel),
      data_nascimento: generateDate(2010, 2020), // 4-14 years old
      data_inicio_transporte: generateDate(2024, 2024),
      
      ...overrides
    };
  }
};
