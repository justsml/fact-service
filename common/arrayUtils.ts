export const toArray = <TItem>(value: TItem | TItem[]) =>
  Array.isArray(value) ? value : [value];
