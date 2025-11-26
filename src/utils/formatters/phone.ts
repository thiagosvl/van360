export function formatarTelefone(telefone: string): string {
  const numeros = telefone.replace(/\D/g, "");
  if (numeros.length !== 11) return telefone;

  const ddd = numeros.slice(0, 2);
  const parte1 = numeros.slice(2, 7);
  const parte2 = numeros.slice(7);

  return `(${ddd}) ${parte1}-${parte2}`;
}

