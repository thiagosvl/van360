export function cleanString(str: any, capitalize = false) {
  if (!str) return "";
  if (typeof str !== "string") return str;

  let cleaned = str.trim().replace(/\s+/g, " ");

  if (capitalize) {
    cleaned = cleaned
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  return cleaned;
}

export function truncate(value: string, length = 50, suffix = "...") {
  if (!value) return "";
  if (value.length <= length) return value;
  return `${value.substring(0, length).trim()}${suffix}`;
}

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

