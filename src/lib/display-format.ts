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
