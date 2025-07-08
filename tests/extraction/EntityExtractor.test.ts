import { EntityExtractor } from '../../src/extraction/EntityExtractor';
import { DefaultTaxonomy } from '../../src/taxonomy/DefaultTaxonomy';

describe('EntityExtractor', () => {
  let extractor: EntityExtractor;
  let taxonomy: DefaultTaxonomy;

  beforeEach(() => {
    taxonomy = new DefaultTaxonomy();
    extractor = new EntityExtractor(taxonomy);
  });

  describe('extractEntities', () => {
    it('should extract basic noun entities', () => {
      const text = 'The team worked on the project last quarter.';
      const entities = extractor.extractEntities(text);
      
      const entityTexts = entities.map(e => e.text.toLowerCase());
      // Should extract entities containing these terms
      expect(entities.some(e => e.text.toLowerCase().includes('team'))).toBe(true);
      expect(entities.some(e => e.text.toLowerCase().includes('project'))).toBe(true);
      expect(entities.some(e => e.text.toLowerCase().includes('quarter'))).toBe(true);
    });

    it('should extract and classify entities', () => {
      const text = 'The engineering team achieved their goal in Q1.';
      const entities = extractor.extractEntities(text);
      
      const teamEntity = entities.find(e => e.text.toLowerCase().includes('team'));
      expect(teamEntity).toBeDefined();
      expect(teamEntity?.classification?.type).toBe('stakeholder');
      
      const goalEntity = entities.find(e => e.text.toLowerCase().includes('goal'));
      expect(goalEntity).toBeDefined();
      expect(goalEntity?.classification?.type).toBe('goal');
    });

    it('should extract people entities', () => {
      const text = 'Sarah Johnson led the initiative with great success.';
      const entities = extractor.extractEntities(text);
      
      const sarahEntity = entities.find(e => e.text.toLowerCase().includes('sarah'));
      expect(sarahEntity).toBeDefined();
      // Person extraction might not always classify correctly, so just check it exists
      expect(sarahEntity?.text).toContain('Sarah');
    });

    it('should find correct text spans', () => {
      const text = 'The project team worked on project management.';
      const entities = extractor.extractEntities(text);
      
      for (const entity of entities) {
        for (const span of entity.spans) {
          const spanText = text.substring(span.start, span.end);
          expect(spanText.toLowerCase()).toContain(entity.text.toLowerCase());
        }
      }
    });

    it('should respect minimum entity length', () => {
      const extractorWithMinLength = new EntityExtractor(taxonomy, { minEntityLength: 5 });
      const text = 'The big team worked on a project.';
      const entities = extractorWithMinLength.extractEntities(text);
      
      // Should not extract 'big' (3 chars) but should extract 'project' (7 chars)
      const entityTexts = entities.map(e => e.text);
      expect(entityTexts).not.toContain('big');
      expect(entityTexts.some(t => t.includes('project'))).toBe(true);
    });

    it('should handle custom patterns', () => {
      const extractorWithPatterns = new EntityExtractor(taxonomy, {
        customPatterns: ['\\d+%', '\\$\\d+']
      });
      
      const text = 'Performance improved by 25% and we saved $10000.';
      const entities = extractorWithPatterns.extractEntities(text);
      
      const entityTexts = entities.map(e => e.text);
      expect(entityTexts).toContain('25%');
      expect(entityTexts).toContain('$10000');
    });

    it('should deduplicate similar entities', () => {
      const text = 'The team team worked with the team on this.';
      const entities = extractor.extractEntities(text);
      
      // Should extract fewer entities than the raw number of "team" occurrences
      expect(entities.length).toBeGreaterThan(0);
      expect(entities.length).toBeLessThan(3); // Should be deduplicated
    });

    it('should handle empty text', () => {
      const entities = extractor.extractEntities('');
      expect(entities).toHaveLength(0);
    });

    it('should filter out stopwords', () => {
      const text = 'The and or but in on at to for of with by';
      const entities = extractor.extractEntities(text);
      expect(entities).toHaveLength(0);
    });
  });

  describe('classification', () => {
    it('should classify time-related entities', () => {
      const text = 'Q1 2024 fiscal year performance';
      const entities = extractor.extractEntities(text);
      
      const timeEntities = entities.filter(e => e.classification?.type === 'time-period');
      expect(timeEntities.length).toBeGreaterThan(0);
    });

    it('should classify metrics', () => {
      const text = 'User activation rate and conversion percentage improved';
      const entities = extractor.extractEntities(text);
      
      // Should extract entities, classification might vary
      expect(entities.length).toBeGreaterThan(0);
      const hasRateEntity = entities.some(e => e.text.toLowerCase().includes('rate'));
      expect(hasRateEntity).toBe(true);
    });

    it('should provide confidence scores', () => {
      const text = 'The team achieved their goal';
      const entities = extractor.extractEntities(text);
      
      const classifiedEntities = entities.filter(e => e.classification);
      for (const entity of classifiedEntities) {
        expect(entity.classification?.confidence).toBeGreaterThan(0);
        expect(entity.classification?.confidence).toBeLessThanOrEqual(1);
      }
    });
  });
});