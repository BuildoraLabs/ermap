export function formatPhoneDisplay(value: string) {
  const digits = value.replace(/\D/g, "");
  const hasCountryCode = /^\+91/.test(value) && digits.length === 12;
  const national = hasCountryCode ? digits.slice(2) : digits;

  if (national.startsWith("1800") && national.length === 11) {
    return `1800 ${national.slice(4, 7)} ${national.slice(7)}`;
  }
  if (national.startsWith("080") && national.length === 11) {
    return `080-${national.slice(3, 7)}-${national.slice(7)}`;
  }
  if (national.length === 10) {
    const formatted = `${national.slice(0, 5)} ${national.slice(5)}`;
    return hasCountryCode ? `+91 ${formatted}` : formatted;
  }
  return value;
}

export function phoneHref(value: string) {
  return value.replace(/\D/g, "");
}

export function formatDateDisplay(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function isReverificationDue(lastVerified: string) {
  const timestamp = Date.parse(`${lastVerified}T00:00:00Z`);
  return Number.isFinite(timestamp) && Date.now() - timestamp > 90 * 24 * 60 * 60 * 1000;
}
