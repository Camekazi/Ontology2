import { Taxonomy, TaxonomyClass } from './types';
export declare const DEFAULT_TAXONOMY_CLASSES: TaxonomyClass[];
export declare class DefaultTaxonomy implements Taxonomy {
    readonly id = "dotwork-default";
    readonly name = "Dotwork Default Taxonomy";
    readonly version = "1.0.0";
    readonly description = "Default 10-class taxonomy for narrative-to-ontology transformation";
    readonly classes: TaxonomyClass[];
    getClass(id: string): TaxonomyClass | undefined;
    getClassByName(name: string): TaxonomyClass | undefined;
    findMatchingClasses(text: string): TaxonomyClass[];
    classifyText(text: string): {
        class: TaxonomyClass;
        confidence: number;
    } | null;
    private calculateConfidence;
    toJSON(): Taxonomy;
}
//# sourceMappingURL=DefaultTaxonomy.d.ts.map