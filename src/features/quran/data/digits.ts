/** Converts Bangla and Arabic-Indic digits to ASCII so "২:২৫৫" and "٢:٢٥٥" parse. */
export function toAsciiDigits(input: string): string {
  return input
    .replace(/[০-৯]/g, (d) => String(d.charCodeAt(0) - 0x09e6))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0));
}

/** Removes Arabic diacritics so plain-typed names match. */
export function stripTashkeel(input: string): string {
  return input.replace(/[ً-ٰٟۖ-ۭ]/g, '').replace(/ٱ/g, 'ا');
}
