export interface TaxonomyClass {
  id: string;
  name: string;
  description: string;
  color?: string;
  keywords: string[];
  patterns: string[];
  parent?: string;
}

export interface Taxonomy {
  id: string;
  name: string;
  version: string;
  classes: TaxonomyClass[];
  description?: string;
}