const CC_PREFIX = "cc:";
const CP_PREFIX = "cp:";

export function isCustomCityRef(id: string): boolean {
  return id.startsWith(CC_PREFIX);
}

export function parseCustomCityRef(id: string): number {
  return Number(id.slice(CC_PREFIX.length));
}

export function toCustomCityRef(numId: number): string {
  return `${CC_PREFIX}${numId}`;
}

export function isCustomPlaceRef(id: string): boolean {
  return id.startsWith(CP_PREFIX);
}

export function parseCustomPlaceRef(id: string): number {
  return Number(id.slice(CP_PREFIX.length));
}

export function toCustomPlaceRef(numId: number): string {
  return `${CP_PREFIX}${numId}`;
}
