// src/app/core/constants/options.ts

export const relativeOptions = [
  { value: 'Father', label: 'Padre' },
  { value: 'Mother', label: 'Madre' },
  { value: 'Grandparent', label: 'Abuelo/a' },
  { value: 'UncleAunt', label: 'Tío/a' },
  { value: 'Sibling', label: 'Hermano/a' },
  { value: 'Cousin', label: 'Primo/a' },
  { value: 'Child', label: 'Hijo/a' },
  { value: 'Nibling', label: 'Sobrino/a' },
];

export const historyTypeOptions = [
  { value: 'Pathological', label: 'Patológico' },
  { value: 'Non-Pathological', label: 'No Patológico' },
  { value: 'Hereditary', label: 'Hereditario' },
  { value: 'Congenital', label: 'Congénito' },
  { value: 'Chronic', label: 'Crónico' },
  { value: 'Allergic', label: 'Alérgico' },
];

export const getLabel = (
  options: { value: string; label: string }[],
  value: string
): string => options.find((option) => option.value === value)?.label || value;
