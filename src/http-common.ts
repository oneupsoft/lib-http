/**
 * A dictionary of string-toString items.
 */
export type Dictionary = { [key: string]: { toString(): string } | undefined };
