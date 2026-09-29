function normalizePersonName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

export function isSamePerson(nameA?: string | null, nameB?: string | null): boolean {
  if (!nameA || !nameB) return false;
  const a = normalizePersonName(nameA);
  const b = normalizePersonName(nameB);
  if (!a || !b) return false;

  if (a === b) return true;

  const stopwords = new Set(['da', 'de', 'do', 'das', 'dos', 'e']);
  const tokensA = a.split(' ').filter(t => !stopwords.has(t));
  const tokensB = b.split(' ').filter(t => !stopwords.has(t));

  if (tokensA.length === 0 || tokensB.length === 0) return false;

  const firstA = tokensA[0];
  const firstB = tokensB[0];

  if (firstA !== firstB) return false;

  if (tokensA.length === 1 || tokensB.length === 1) return true;

  const setB = new Set(tokensB.slice(1));
  return tokensA.slice(1).some(t => setB.has(t));
}

