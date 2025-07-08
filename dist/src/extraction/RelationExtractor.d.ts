import { Entity } from '../core/types';
import { Relation as RelationClass } from '../core/Relation';
export interface RelationPattern {
    pattern: RegExp;
    label: string;
    confidence: number;
    direction: 'forward' | 'backward' | 'bidirectional';
}
export interface RelationExtractionOptions {
    maxDistance?: number;
    minConfidence?: number;
    customPatterns?: RelationPattern[];
}
export declare class RelationExtractor {
    private options;
    private defaultPatterns;
    constructor(options?: RelationExtractionOptions);
    extractRelations(text: string, entities: Entity[]): RelationClass[];
    private createEntityPositionMap;
    private findRelationsBetweenEntities;
    private createRelation;
    addCustomPattern(pattern: RelationPattern): void;
    getAvailablePatterns(): RelationPattern[];
}
//# sourceMappingURL=RelationExtractor.d.ts.map