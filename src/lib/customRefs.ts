const CC_PREFIX = "cc:";
const CP_PREFIX = "cp:";

export function isCustomCityRef(id: string): boolean {
  return id.startsWith(CC_PREFIX);
}

export function parseCustomCityRef(id: string): string {
  return id.slice(CC_PREFIX.length);
}

export function toCustomCityRef(uuid: string): string {
  return `${CC_PREFIX}${uuid}`;
}

export function isCustomPlaceRef(id: string): boolean {
  return id.startsWith(CP_PREFIX);
}

export function parseCustomPlaceRef(id: string): string {
  return id.slice(CP_PREFIX.length);
}

export function toCustomPlaceRef(uuid: string): string {
  return `${CP_PREFIX}${uuid}`;
}
