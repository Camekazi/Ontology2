import { Narrative } from '../core/Narrative';
import { Ontology } from '../core/Ontology';
import { EntityExtractor, ExtractionOptions } from '../extraction/EntityExtractor';
import { RelationExtractor, RelationExtractionOptions } from '../extraction/RelationExtractor';
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

export class NarrativeProcessor {
  private entityExtractor: EntityExtractor;
  private relationExtractor: RelationExtractor;
  private taxonomy: DefaultTaxonomy;

  constructor(options?: ProcessingOptions) {
    this.taxonomy = options?.taxonomy || new DefaultTaxonomy();
    this.entityExtractor = new EntityExtractor(this.taxonomy, options?.entityExtractionOptions);
    this.relationExtractor = new RelationExtractor(options?.relationExtractionOptions);
  }

  public async processNarrative(text: string, narrativeId?: string): Promise<ProcessingResult> {
    const startTime = Date.now();

    // Step 1: Create narrative
    const narrative = new Narrative(text, narrativeId);

    // Step 2: Extract entities
    const entities = this.entityExtractor.extractEntities(text);
    entities.forEach(entity => narrative.addEntity(entity));

    // Step 3: Extract relations
    const relations = this.relationExtractor.extractRelations(text, entities);
    relations.forEach(relation => narrative.addRelation(relation));

    // Step 4: Generate ontology
    const ontology = Ontology.fromNarrative(narrative);

    // Step 5: Calculate stats
    const processingTime = Date.now() - startTime;
    const classifiedEntities = entities.filter(e => e.classification);
    const classificationCoverage = entities.length > 0 ? classifiedEntities.length / entities.length : 0;

    const stats = {
      entityCount: entities.length,
      relationCount: relations.length,
      processingTime,
      classificationCoverage
    };

    return {
      narrative,
      ontology,
      stats
    };
  }

  public async processMultipleNarratives(texts: string[]): Promise<ProcessingResult[]> {
    const results: ProcessingResult[] = [];

    for (let i = 0; i < texts.length; i++) {
      const result = await this.processNarrative(texts[i], `narrative-${i + 1}`);
      results.push(result);
    }

    return results;
  }

  public async processBatch(narratives: Array<{ id: string; text: string }>): Promise<Map<string, ProcessingResult>> {
    const results = new Map<string, ProcessingResult>();

    for (const { id, text } of narratives) {
      const result = await this.processNarrative(text, id);
      results.set(id, result);
    }

    return results;
  }

  public getProcessingStats(results: ProcessingResult[]): {
    totalEntities: number;
    totalRelations: number;
    averageProcessingTime: number;
    averageClassificationCoverage: number;
    entitiesByType: Record<string, number>;
    relationsByLabel: Record<string, number>;
  } {
    const totalEntities = results.reduce((sum, r) => sum + r.stats.entityCount, 0);
    const totalRelations = results.reduce((sum, r) => sum + r.stats.relationCount, 0);
    const averageProcessingTime = results.reduce((sum, r) => sum + r.stats.processingTime, 0) / results.length;
    const averageClassificationCoverage = results.reduce((sum, r) => sum + r.stats.classificationCoverage, 0) / results.length;

    const entitiesByType: Record<string, number> = {};
    const relationsByLabel: Record<string, number> = {};

    for (const result of results) {
      // Count entities by type
      for (const entity of result.narrative.entities) {
        const type = entity.classification?.type || 'unclassified';
        entitiesByType[type] = (entitiesByType[type] || 0) + 1;
      }

      // Count relations by label
      for (const relation of result.narrative.relations) {
        relationsByLabel[relation.label] = (relationsByLabel[relation.label] || 0) + 1;
      }
    }

    return {
      totalEntities,
      totalRelations,
      averageProcessingTime,
      averageClassificationCoverage,
      entitiesByType,
      relationsByLabel
    };
  }
}