import { DefaultTaxonomy } from '../../src/taxonomy/DefaultTaxonomy';

describe('DefaultTaxonomy', () => {
  let taxonomy: DefaultTaxonomy;

  beforeEach(() => {
    taxonomy = new DefaultTaxonomy();
  });

  describe('constructor', () => {
    it('should initialize with default properties', () => {
      expect(taxonomy.id).toBe('dotwork-default');
      expect(taxonomy.name).toBe('Dotwork Default Taxonomy');
      expect(taxonomy.version).toBe('1.0.0');
      expect(taxonomy.classes).toHaveLength(10);
    });
  });

  describe('getClass', () => {
    it('should return class by ID', () => {
      const goalClass = taxonomy.getClass('goal');
      expect(goalClass).toBeDefined();
      expect(goalClass?.name).toBe('Goal');
    });

    it('should return undefined for non-existent ID', () => {
      const nonExistent = taxonomy.getClass('non-existent');
      expect(nonExistent).toBeUndefined();
    });
  });

  describe('getClassByName', () => {
    it('should return class by name (case insensitive)', () => {
      const goalClass = taxonomy.getClassByName('Goal');
      expect(goalClass).toBeDefined();
      expect(goalClass?.id).toBe('goal');
    });

    it('should work with lowercase', () => {
      const goalClass = taxonomy.getClassByName('goal');
      expect(goalClass).toBeDefined();
      expect(goalClass?.id).toBe('goal');
    });
  });

  describe('findMatchingClasses', () => {
    it('should find classes by keyword match', () => {
      const matches = taxonomy.findMatchingClasses('Our goal is to improve performance');
      const goalMatches = matches.filter(m => m.id === 'goal');
      expect(goalMatches).toHaveLength(1);
    });

    it('should find classes by pattern match', () => {
      const matches = taxonomy.findMatchingClasses('Q1 2024 results');
      const timePeriodMatches = matches.filter(m => m.id === 'time-period');
      expect(timePeriodMatches).toHaveLength(1);
    });

    it('should find multiple matching classes', () => {
      const matches = taxonomy.findMatchingClasses('The team achieved the goal in Q1');
      const matchIds = matches.map(m => m.id);
      expect(matchIds).toContain('stakeholder'); // team
      expect(matchIds).toContain('goal'); // goal
      expect(matchIds).toContain('time-period'); // Q1
    });

    it('should return empty array for no matches', () => {
      const matches = taxonomy.findMatchingClasses('xyz random text abc');
      expect(matches).toHaveLength(0);
    });
  });

  describe('classifyText', () => {
    it('should classify text with confidence score', () => {
      const result = taxonomy.classifyText('Our main goal is success');
      expect(result).toBeDefined();
      // Classification might return 'goal' or 'outcome' depending on matching
      expect(['goal', 'outcome']).toContain(result?.class.id);
      expect(result?.confidence).toBeGreaterThan(0);
      expect(result?.confidence).toBeLessThanOrEqual(1);
    });

    it('should return null for unclassifiable text', () => {
      const result = taxonomy.classifyText('xyz random unclassifiable text');
      expect(result).toBeNull();
    });

    it('should handle time period patterns', () => {
      const result = taxonomy.classifyText('Q4 performance');
      expect(result).toBeDefined();
      expect(result?.class.id).toBe('time-period');
    });

    it('should handle stakeholder keywords', () => {
      const result = taxonomy.classifyText('engineering team collaboration');
      expect(result).toBeDefined();
      expect(result?.class.id).toBe('stakeholder');
    });
  });

  describe('toJSON', () => {
    it('should serialize to JSON', () => {
      const json = taxonomy.toJSON();
      expect(json.id).toBe(taxonomy.id);
      expect(json.name).toBe(taxonomy.name);
      expect(json.version).toBe(taxonomy.version);
      expect(json.classes).toEqual(taxonomy.classes);
    });
  });

  describe('taxonomy classes', () => {
    it('should have all required class properties', () => {
      for (const taxonomyClass of taxonomy.classes) {
        expect(taxonomyClass.id).toBeDefined();
        expect(taxonomyClass.name).toBeDefined();
        expect(taxonomyClass.description).toBeDefined();
        expect(taxonomyClass.keywords).toBeInstanceOf(Array);
        expect(taxonomyClass.patterns).toBeInstanceOf(Array);
        expect(taxonomyClass.color).toBeDefined();
      }
    });

    it('should have unique class IDs', () => {
      const ids = taxonomy.classes.map(c => c.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should contain all expected base classes', () => {
      const expectedIds = [
        'time-period', 'initiative', 'outcome', 'stakeholder', 'process',
        'resource', 'goal', 'metric', 'insight', 'principle'
      ];
      
      const actualIds = taxonomy.classes.map(c => c.id);
      for (const expectedId of expectedIds) {
        expect(actualIds).toContain(expectedId);
      }
    });
  });
});