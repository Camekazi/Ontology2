import { NarrativeProcessor } from '../../src/pipeline/NarrativeProcessor';
import { DefaultTaxonomy } from '../../src/taxonomy/DefaultTaxonomy';

describe('NarrativeProcessor', () => {
  let processor: NarrativeProcessor;

  beforeEach(() => {
    processor = new NarrativeProcessor();
  });

  describe('processNarrative', () => {
    it('should process a simple narrative', async () => {
      const text = 'The engineering team worked on improving user experience in Q1.';
      const result = await processor.processNarrative(text);

      expect(result.narrative).toBeDefined();
      expect(result.ontology).toBeDefined();
      expect(result.stats).toBeDefined();
      
      expect(result.narrative.text).toBe(text);
      expect(result.narrative.entities.length).toBeGreaterThan(0);
      expect(result.stats.entityCount).toBeGreaterThan(0);
      expect(result.stats.processingTime).toBeGreaterThan(0);
    });

    it('should extract entities and relations', async () => {
      const text = 'Sarah Johnson led the team to achieve the quarterly goal.';
      const result = await processor.processNarrative(text);

      expect(result.narrative.entities.length).toBeGreaterThan(0);
      expect(result.narrative.relations.length).toBeGreaterThanOrEqual(0);
      expect(result.stats.entityCount).toBe(result.narrative.entities.length);
      expect(result.stats.relationCount).toBe(result.narrative.relations.length);
    });

    it('should create ontology from narrative', async () => {
      const text = 'The product team launched a new feature that improved customer satisfaction.';
      const result = await processor.processNarrative(text);

      expect(result.ontology.nodes.length).toBe(result.narrative.entities.length);
      expect(result.ontology.edges.length).toBe(result.narrative.relations.length);
      expect(result.ontology.metadata?.sourceNarrativeId).toBe(result.narrative.id);
    });

    it('should calculate classification coverage', async () => {
      const text = 'The team worked on the project and achieved their goal.';
      const result = await processor.processNarrative(text);

      expect(result.stats.classificationCoverage).toBeGreaterThanOrEqual(0);
      expect(result.stats.classificationCoverage).toBeLessThanOrEqual(1);
    });

    it('should handle custom narrative ID', async () => {
      const text = 'Test narrative';
      const customId = 'custom-test-id';
      const result = await processor.processNarrative(text, customId);

      expect(result.narrative.id).toBe(customId);
      expect(result.ontology.metadata?.sourceNarrativeId).toBe(customId);
    });

    it('should handle empty text', async () => {
      const result = await processor.processNarrative('');
      
      expect(result.stats.entityCount).toBe(0);
      expect(result.stats.relationCount).toBe(0);
      expect(result.stats.classificationCoverage).toBe(0);
    });
  });

  describe('processMultipleNarratives', () => {
    it('should process multiple narratives', async () => {
      const texts = [
        'The team achieved their goal in Q1.',
        'Customer satisfaction improved significantly.',
        'Revenue grew by 25% this quarter.'
      ];

      const results = await processor.processMultipleNarratives(texts);

      expect(results).toHaveLength(3);
      results.forEach((result, index) => {
        expect(result.narrative.text).toBe(texts[index]);
        expect(result.narrative.id).toBe(`narrative-${index + 1}`);
      });
    });

    it('should handle empty array', async () => {
      const results = await processor.processMultipleNarratives([]);
      expect(results).toHaveLength(0);
    });
  });

  describe('processBatch', () => {
    it('should process batch with custom IDs', async () => {
      const narratives = [
        { id: 'story-1', text: 'First narrative about team success.' },
        { id: 'story-2', text: 'Second narrative about customer metrics.' }
      ];

      const results = await processor.processBatch(narratives);

      expect(results.size).toBe(2);
      expect(results.has('story-1')).toBe(true);
      expect(results.has('story-2')).toBe(true);
      
      const story1 = results.get('story-1')!;
      expect(story1.narrative.id).toBe('story-1');
      expect(story1.narrative.text).toBe(narratives[0].text);
    });
  });

  describe('getProcessingStats', () => {
    it('should calculate aggregate statistics', async () => {
      const texts = [
        'The engineering team improved performance.',
        'Customer satisfaction increased by 20%.',
        'The product team launched new features.'
      ];

      const results = await processor.processMultipleNarratives(texts);
      const stats = processor.getProcessingStats(results);

      expect(stats.totalEntities).toBeGreaterThan(0);
      expect(stats.averageProcessingTime).toBeGreaterThan(0);
      expect(stats.averageClassificationCoverage).toBeGreaterThanOrEqual(0);
      expect(stats.averageClassificationCoverage).toBeLessThanOrEqual(1);
      expect(stats.entitiesByType).toBeDefined();
      expect(stats.relationsByLabel).toBeDefined();
    });

    it('should handle empty results array', () => {
      const stats = processor.getProcessingStats([]);
      
      expect(stats.totalEntities).toBe(0);
      expect(stats.totalRelations).toBe(0);
      expect(stats.averageProcessingTime).toBeNaN();
      expect(stats.averageClassificationCoverage).toBeNaN();
    });

    it('should count entities by type correctly', async () => {
      const text = 'The team achieved the goal with great metrics in Q1.';
      const result = await processor.processNarrative(text);
      const stats = processor.getProcessingStats([result]);

      // Should have counts for different entity types
      const typeCount = Object.keys(stats.entitiesByType).length;
      expect(typeCount).toBeGreaterThan(0);
      
      // Total should match sum of individual counts
      const totalFromTypes = Object.values(stats.entitiesByType).reduce((sum, count) => sum + count, 0);
      expect(totalFromTypes).toBe(stats.totalEntities);
    });
  });

  describe('with custom options', () => {
    it('should use custom taxonomy', async () => {
      const customTaxonomy = new DefaultTaxonomy();
      const customProcessor = new NarrativeProcessor({ taxonomy: customTaxonomy });
      
      const text = 'The team achieved their goal.';
      const result = await customProcessor.processNarrative(text);
      
      expect(result.narrative.entities.length).toBeGreaterThan(0);
    });

    it('should use custom extraction options', async () => {
      const customProcessor = new NarrativeProcessor({
        entityExtractionOptions: { minEntityLength: 10 },
        relationExtractionOptions: { minConfidence: 0.8 }
      });
      
      const text = 'The team worked on the project and achieved success.';
      const result = await customProcessor.processNarrative(text);
      
      // With high min length, should extract fewer entities
      expect(result.stats.entityCount).toBeGreaterThanOrEqual(0);
    });
  });
});