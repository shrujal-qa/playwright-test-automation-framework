/**
 * The Leave module's date inputs on this OrangeHRM instance use the
 * `yyyy-dd-mm` display format (confirmed from the live input's
 * `placeholder` attribute) rather than ISO `yyyy-mm-dd`. `DataGenerator`
 * stays format-agnostic and always returns ISO — this converts at the UI
 * boundary, where the page objects that actually know the field's format
 * belong.
 */
export function toLeaveDateFormat(isoDate: string): string {
    const [year, month, day] = isoDate.split('-');
    return `${year}-${day}-${month}`;
}
