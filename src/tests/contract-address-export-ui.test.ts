import { describe, it, expect } from "vitest";
import {
  obterUrlDocumentoContrato,
  substituirPlaceholdersContrato,
} from "@/utils/domain/contrato/contratoUtils";
import {
  formatarCEP,
  formatarEnderecoCompleto,
  formatarEnderecoParcialRota,
} from "@/utils/addressUtils";
import {
  sanitizarCampoCSV,
  gerarConteudoCSV,
  exportarParaCSV,
  ColunaCSV,
} from "@/utils/exportUtils";
import { ContratoStatus } from "@/types/enums";

describe("Suíte de Testes dos Utilitários do Frontend (Contratos, Endereços e Exportação)", () => {
  describe("Utilitários de Contrato (contratoUtils.ts)", () => {
    it("Deve obter URL correta do documento de contrato com base no status", () => {
      const assinado = {
        status: ContratoStatus.ASSINADO,
        contrato_final_url: "https://bucket.com/contrato-final.pdf",
        minuta_url: "https://bucket.com/minuta.pdf",
      };
      expect(obterUrlDocumentoContrato(assinado)).toBe("https://bucket.com/contrato-final.pdf");

      const pendente = {
        status_contrato: ContratoStatus.PENDENTE,
        contrato_final_url: "https://bucket.com/contrato-final.pdf",
        minuta_url: "https://bucket.com/minuta.pdf",
      };
      expect(obterUrlDocumentoContrato(pendente)).toBe("https://bucket.com/minuta.pdf");

      const semStatus = {
        contrato_url: "https://bucket.com/contrato.pdf",
      };
      expect(obterUrlDocumentoContrato(semStatus)).toBe("https://bucket.com/contrato.pdf");

      expect(obterUrlDocumentoContrato(null)).toBeNull();
      expect(obterUrlDocumentoContrato(undefined)).toBeNull();
    });

    it("Deve substituir placeholders dinâmicos em textos contratuais", () => {
      const template = "Eu, {{NOME}}, portador do CPF {{CPF}}, contrato o serviço por R$ {{VALOR}}.";
      const dados = {
        NOME: "Carlos Andrade",
        CPF: "123.456.789-00",
        VALOR: 350.5,
      };

      const resultado = substituirPlaceholdersContrato(template, dados);
      expect(resultado).toBe("Eu, Carlos Andrade, portador do CPF 123.456.789-00, contrato o serviço por R$ 350.5.");
    });

    it("Deve tratar espaços extras nos placeholders e substituir nulos por string vazia", () => {
      const template = "Contratante: {{ NOME }} | Responsável: {{ RESPONSAVEL }} | OBS: {{OBS}}";
      const dados = {
        NOME: "Mariana Souza",
        RESPONSAVEL: null,
        OBS: undefined,
      };

      const resultado = substituirPlaceholdersContrato(template, dados);
      expect(resultado).toBe("Contratante: Mariana Souza | Responsável:  | OBS: ");
    });

    it("Deve retornar texto original se não houver placeholders ou se dados forem nulos", () => {
      const textoSemTag = "Contrato padrão sem variáveis.";
      expect(substituirPlaceholdersContrato(textoSemTag, { NOME: "João" })).toBe(textoSemTag);
      expect(substituirPlaceholdersContrato(textoSemTag, null)).toBe(textoSemTag);
      expect(substituirPlaceholdersContrato(null, { NOME: "João" })).toBe("");
    });
  });

  describe("Utilitários de Endereço (addressUtils.ts)", () => {
    it("Deve formatar CEP corretamente", () => {
      expect(formatarCEP("01310100")).toBe("01310-100");
      expect(formatarCEP("01310-100")).toBe("01310-100");
      expect(formatarCEP("123")).toBe("123");
      expect(formatarCEP("")).toBe("");
    });

    it("Deve formatar endereço completo a partir dos componentes", () => {
      const enderecoCompleto = formatarEnderecoCompleto({
        logradouro: "Avenida Paulista",
        numero: "1000",
        complemento: "Apto 42",
        bairro: "Bela Vista",
        cidade: "São Paulo",
        estado: "SP",
        cep: "01310100",
      });

      expect(enderecoCompleto).toBe("Avenida Paulista, 1000 - Apto 42 - Bela Vista, São Paulo - SP, 01310-100");
    });

    it("Deve tratar adequadamente componentes nulos, indefinidos e nulos parciais de endereço", () => {
      const enderecoParcial1 = formatarEnderecoCompleto({
        logradouro: "Rua das Flores",
        numero: null,
        complemento: undefined,
        bairro: "Centro",
        cidade: "Curitiba",
        uf: "PR",
        cep: null,
      });
      expect(enderecoParcial1).toBe("Rua das Flores - Centro, Curitiba - PR");

      const enderecoParcial2 = formatarEnderecoCompleto({
        endereco: "Rodovia BR-101",
        numero: "KM 50",
        cidade: "Joinville",
        estado: "SC",
      });
      expect(enderecoParcial2).toBe("Rodovia BR-101, KM 50, Joinville - SC");

      expect(formatarEnderecoCompleto(null)).toBe("");
      expect(formatarEnderecoCompleto({})).toBe("");
    });

    it("Deve formatar endereço parcial para exibição em rotas", () => {
      const enderecoRota = formatarEnderecoParcialRota({
        logradouro: "Rua Chile",
        numero: "500",
        complemento: "Bloco B",
        bairro: "Jardim América",
        cidade: "Campinas",
      });
      expect(enderecoRota).toBe("Rua Chile, 500 (Bloco B) - Jardim América");

      expect(formatarEnderecoParcialRota(null)).toBe("");
    });
  });

  describe("Utilitários de Exportação CSV (exportUtils.ts)", () => {
    it("Deve sanitizar campos contendo vírgulas, aspas e quebras de linha", () => {
      expect(sanitizarCampoCSV("Texto Simples")).toBe("Texto Simples");
      expect(sanitizarCampoCSV("Rua A, 123")).toBe('"Rua A, 123"');
      expect(sanitizarCampoCSV('Empresa "Alfa"')).toBe('"Empresa ""Alfa"""');
      expect(sanitizarCampoCSV("Linha1\nLinha2")).toBe('"Linha1\nLinha2"');
      expect(sanitizarCampoCSV(null)).toBe("");
      expect(sanitizarCampoCSV(undefined)).toBe("");
      expect(sanitizarCampoCSV(150)).toBe("150");
      expect(sanitizarCampoCSV(true)).toBe("true");
    });

    it("Deve gerar conteúdo CSV estruturado com cabeçalhos e dados sanitizados", () => {
      interface MockRelatorio {
        nome: string;
        endereco: string;
        valor: number;
      }

      const colunas: ColunaCSV<MockRelatorio>[] = [
        { chave: "nome", titulo: "Nome do Cliente" },
        { chave: "endereco", titulo: "Endereço Completo" },
        { chave: "valor", titulo: "Valor (R$)" },
      ];

      const dados: MockRelatorio[] = [
        { nome: "João da Silva", endereco: "Rua Um, 10", valor: 250 },
        { nome: 'Maria "Chiquinha"', endereco: "Av. Principal", valor: 300.5 },
      ];

      const csv = gerarConteudoCSV(colunas, dados, ",");
      const linhas = csv.split("\n");

      expect(linhas[0]).toBe("Nome do Cliente,Endereço Completo,Valor (R$)");
      expect(linhas[1]).toBe('João da Silva,"Rua Um, 10",250');
      expect(linhas[2]).toBe('"Maria ""Chiquinha""",Av. Principal,300.5');
    });

    it("Deve permitir a troca de delimitador e tratar coleções vazias em gerarConteudoCSV", () => {
      const colunas = [
        { chave: "id", titulo: "ID" },
        { chave: "status", titulo: "Status" },
      ];

      const csvPontoVirgula = gerarConteudoCSV(colunas, [{ id: 1, status: "OK" }], ";");
      expect(csvPontoVirgula).toBe("ID;Status\n1;OK");

      expect(gerarConteudoCSV(colunas, [])).toBe("ID,Status");
      expect(gerarConteudoCSV([], [])).toBe("");
    });

    it("Deve executar exportarParaCSV sem erros e retornar o conteúdo gerado", () => {
      const colunas = [{ chave: "item", titulo: "Item" }];
      const dados = [{ item: "Teste" }];

      const resultado = exportarParaCSV("relatorio_teste", colunas, dados);
      expect(resultado).toBe("Item\nTeste");
    });
  });
});
