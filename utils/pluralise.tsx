export const pluralise = (count: number, singular: string, plural: string) => {
  return count === 1 ? singular : plural;
};
