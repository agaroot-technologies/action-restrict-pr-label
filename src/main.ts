import type { Rule } from './type';

export type MainOptions = {
  base: string;
  head: string;
  rules: Rule[];
};

export const main = ({
  base,
  head,
  rules,
}: MainOptions) => {
  console.log({
    base,
    head,
    rules,
  });
};
