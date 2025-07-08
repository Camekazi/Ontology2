import { Entity as EntityClass } from '../core/Entity';
import { DefaultTaxonomy } from '../taxonomy/DefaultTaxonomy';
export interface ExtractionOptions {
    minEntityLength?: number;
    maxEntityLength?: number;
    includePronouns?: boolean;
    customPatterns?: string[];
}
export declare class EntityExtractor {
    private taxonomy;
    private options;
    constructor(taxonomy?: DefaultTaxonomy, options?: ExtractionOptions);
    extractEntities(text: string): EntityClass[];
    private isValidEntity;
    private findTextSpans;
    private escapeRegExp;
    private classifyEntity;
    private deduplicateEntities;
}
//# sourceMappingURL=EntityExtractor.d.ts.map