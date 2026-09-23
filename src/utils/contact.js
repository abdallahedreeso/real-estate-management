export function egyptianWhatsAppNumber(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (/^01[0125]\d{8}$/.test(digits)) return `2${digits}`;
  if (/^201[0125]\d{8}$/.test(digits)) return digits;
  return null;
}
