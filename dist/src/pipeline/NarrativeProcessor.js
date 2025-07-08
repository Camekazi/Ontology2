"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NarrativeProcessor = void 0;
const Narrative_1 = require("../core/Narrative");
const Ontology_1 = require("../core/Ontology");
const EntityExtractor_1 = require("../extraction/EntityExtractor");
const RelationExtractor_1 = require("../extraction/RelationExtractor");
const DefaultTaxonomy_1 = require("../taxonomy/DefaultTaxonomy");
class NarrativeProcessor {
    constructor(options) {
        this.taxonomy = options?.taxonomy || new DefaultTaxonomy_1.DefaultTaxonomy();
        this.entityExtractor = new EntityExtractor_1.EntityExtractor(this.taxonomy, options?.entityExtractionOptions);
        this.relationExtractor = new RelationExtractor_1.RelationExtractor(options?.relationExtractionOptions);
    }
    async processNarrative(text, narrativeId) {
        const startTime = Date.now();
        // Step 1: Create narrative
        const narrative = new Narrative_1.Narrative(text, narrativeId);
        // Step 2: Extract entities
        const entities = this.entityExtractor.extractEntities(text);
        entities.forEach(entity => narrative.addEntity(entity));
        // Step 3: Extract relations
        const relations = this.relationExtractor.extractRelations(text, entities);
        relations.forEach(relation => narrative.addRelation(relation));
        // Step 4: Generate ontology
        const ontology = Ontology_1.Ontology.fromNarrative(narrative);
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
    async processMultipleNarratives(texts) {
        const results = [];
        for (let i = 0; i < texts.length; i++) {
            const result = await this.processNarrative(texts[i], `narrative-${i + 1}`);
            results.push(result);
        }
        return results;
    }
    async processBatch(narratives) {
        const results = new Map();
        for (const { id, text } of narratives) {
            const result = await this.processNarrative(text, id);
            results.set(id, result);
        }
        return results;
    }
    getProcessingStats(results) {
        const totalEntities = results.reduce((sum, r) => sum + r.stats.entityCount, 0);
        const totalRelations = results.reduce((sum, r) => sum + r.stats.relationCount, 0);
        const averageProcessingTime = results.reduce((sum, r) => sum + r.stats.processingTime, 0) / results.length;
        const averageClassificationCoverage = results.reduce((sum, r) => sum + r.stats.classificationCoverage, 0) / results.length;
        const entitiesByType = {};
        const relationsByLabel = {};
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
exports.NarrativeProcessor = NarrativeProcessor;
//# sourceMappingURL=NarrativeProcessor.js.map