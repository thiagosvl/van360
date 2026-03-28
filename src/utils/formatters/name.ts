export const formatShortName = (fullName?: string, includeSecond?: boolean) => {
  if (!fullName) return "";
  const names = fullName.trim().split(/\s+/);
  if (includeSecond && names.length >= 2) {
    return `${names[0]} ${names[1]}`;
  }
  if (names.length <= 2) return fullName.trim();
  return names[0] || "";
};

export const formatFirstName = (fullName?: string) => {
  if (!fullName) return "N/Inf.";
  const names = fullName.trim().split(/\s+/);
  return names[0] || "N/Inf.";
};

export const getInitials = (name?: string) => {
  if (!name) return "?";
  return name.trim().charAt(0).toUpperCase();
};
