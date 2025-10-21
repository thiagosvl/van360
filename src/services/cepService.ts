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
};
