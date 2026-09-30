/** Normalises an Indian mobile number: accepts "+91", "91", "0", spaces and dashes. Returns 10 digits or null. */
export function normaliseIndianMobile(input: string): string | null {
  let d = input.replace(/[\s\-().]/g, '');
  if (d.startsWith('+91')) d = d.slice(3);
  else if (d.length === 12 && d.startsWith('91')) d = d.slice(2);
  else if (d.length === 11 && d.startsWith('0')) d = d.slice(1);
  return /^[6-9]\d{9}$/.test(d) ? d : null;
}
