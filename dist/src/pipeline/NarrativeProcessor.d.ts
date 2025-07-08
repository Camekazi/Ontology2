import { Narrative } from '../core/Narrative';
import { Ontology } from '../core/Ontology';
import { ExtractionOptions } from '../extraction/EntityExtractor';
import { RelationExtractionOptions } from '../extraction/RelationExtractor';
import { DefaultTaxonomy } from '../taxonomy/DefaultTaxonomy';
export interface ProcessingOptions {
    entityExtractionOptions?: ExtractionOptions;
    relationExtractionOptions?: RelationExtractionOptions;
    taxonomy?: DefaultTaxonomy;
}
export interface ProcessingResult {
    narrative: Narrative;
    ontology: Ontology;
    stats: {
        entityCount: number;
        relationCount: number;
        processingTime: number;
        classificationCoverage: number;
    };
}
export declare class NarrativeProcessor {
    private entityExtractor;
    private relationExtractor;
    private taxonomy;
    constructor(options?: ProcessingOptions);
    processNarrative(text: string, narrativeId?: string): Promise<ProcessingResult>;
    processMultipleNarratives(texts: string[]): Promise<ProcessingResult[]>;
    processBatch(narratives: Array<{
        id: string;
        text: string;
    }>): Promise<Map<string, ProcessingResult>>;
    getProcessingStats(results: ProcessingResult[]): {
        totalEntities: number;
        totalRelations: number;
        averageProcessingTime: number;
        averageClassificationCoverage: number;
        entitiesByType: Record<string, number>;
        relationsByLabel: Record<string, number>;
    };
}
//# sourceMappingURL=NarrativeProcessor.d.ts.map