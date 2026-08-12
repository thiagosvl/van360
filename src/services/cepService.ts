export interface EnderecoSugestao {
  logradouro: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  displayText: string;
}

export const cepService = {
  async buscarEndereco(cep: string) {
    const cleanCep = cep.replace(/\D/g, "");
    if (cleanCep.length !== 8) return null;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      if (!response.ok) return null;
      const data = await response.json();
      if (data.erro) return null;

      return {
        logradouro: data.logradouro || "",
        bairro: data.bairro || "",
        cidade: data.localidade || "",
        estado: data.uf || "",
      };
    } catch {
      return null;
    }
  },

  async buscarEnderecoPorTexto(logradouro: string, uf?: string, cidade?: string): Promise<EnderecoSugestao[]> {
    const cleanLogradouro = logradouro.trim();
    if (cleanLogradouro.length < 3) return [];

    const state = (uf || "SP").trim().toUpperCase();
    const city = (cidade || "São Paulo").trim();

    try {
      const response = await fetch(
        `https://viacep.com.br/ws/${encodeURIComponent(state)}/${encodeURIComponent(city)}/${encodeURIComponent(cleanLogradouro)}/json/`
      );

      if (!response.ok) return [];
      const data = await response.json();

      if (!Array.isArray(data)) return [];

      return data.slice(0, 5).map((item: any) => ({
        logradouro: item.logradouro || "",
        bairro: item.bairro || "",
        cidade: item.localidade || "",
        estado: item.uf || "",
        cep: item.cep || "",
        displayText: `${item.logradouro || ""}, ${item.bairro || ""} - ${item.localidade || ""}/${item.uf || ""}`,
      }));
    } catch {
      return [];
    }
  },
};
