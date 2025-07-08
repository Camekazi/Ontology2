import { Narrative } from '../../src/core/Narrative';
import { Entity } from '../../src/core/Entity';
import { Relation } from '../../src/core/Relation';

describe('Narrative', () => {
  let narrative: Narrative;

  beforeEach(() => {
    narrative = new Narrative('This is a test narrative about product development.');
  });

  describe('constructor', () => {
    it('should create a narrative with text and auto-generated ID', () => {
      expect(narrative.text).toBe('This is a test narrative about product development.');
      expect(narrative.id).toMatch(/^narrative-\d+-[a-z0-9]+$/);
      expect(narrative.entities).toEqual([]);
      expect(narrative.relations).toEqual([]);
      expect(narrative.createdAt).toBeInstanceOf(Date);
      expect(narrative.updatedAt).toBeInstanceOf(Date);
    });

    it('should create a narrative with custom ID', () => {
      const customNarrative = new Narrative('Test text', 'custom-id');
      expect(customNarrative.id).toBe('custom-id');
    });

    it('should create a narrative with metadata', () => {
      const metadata = { source: 'test', author: 'tester' };
      const narrativeWithMeta = new Narrative('Test text', undefined, metadata);
      expect(narrativeWithMeta.metadata).toEqual(metadata);
    });
  });

  describe('entity management', () => {
    let entity: Entity;

    beforeEach(() => {
      entity = new Entity('test entity', [{ start: 0, end: 4, text: 'test' }]);
    });

    it('should add an entity', () => {
      narrative.addEntity(entity);
      expect(narrative.entities).toHaveLength(1);
      expect(narrative.entities[0]).toBe(entity);
    });

    it('should update updatedAt when adding entity', () => {
      const originalUpdated = narrative.updatedAt;
      // Small delay to ensure timestamp difference
      setTimeout(() => {
        narrative.addEntity(entity);
        expect(narrative.updatedAt.getTime()).toBeGreaterThan(originalUpdated.getTime());
      }, 1);
    });

    it('should get entity by ID', () => {
      narrative.addEntity(entity);
      const found = narrative.getEntity(entity.id);
      expect(found).toBe(entity);
    });

    it('should return undefined for non-existent entity ID', () => {
      const found = narrative.getEntity('non-existent');
      expect(found).toBeUndefined();
    });

    it('should get entities by type', () => {
      entity.setClassification({ type: 'goal', confidence: 0.8 });
      const entity2 = new Entity('another entity', [{ start: 5, end: 10, text: 'another' }]);
      entity2.setClassification({ type: 'outcome', confidence: 0.7 });
      
      narrative.addEntity(entity);
      narrative.addEntity(entity2);
      
      const goalEntities = narrative.getEntitiesByType('goal');
      expect(goalEntities).toHaveLength(1);
      expect(goalEntities[0]).toBe(entity);
    });
  });

  describe('relation management', () => {
    let relation: Relation;
    let entity1: Entity;
    let entity2: Entity;

    beforeEach(() => {
      entity1 = new Entity('entity1', [{ start: 0, end: 7, text: 'entity1' }]);
      entity2 = new Entity('entity2', [{ start: 8, end: 15, text: 'entity2' }]);
      narrative.addEntity(entity1);
      narrative.addEntity(entity2);
      relation = new Relation(entity1.id, entity2.id, 'relates_to', 0.8);
    });

    it('should add a relation', () => {
      narrative.addRelation(relation);
      expect(narrative.relations).toHaveLength(1);
      expect(narrative.relations[0]).toBe(relation);
    });

    it('should get relation by ID', () => {
      narrative.addRelation(relation);
      const found = narrative.getRelation(relation.id);
      expect(found).toBe(relation);
    });

    it('should get relations by label', () => {
      const relation2 = new Relation(entity2.id, entity1.id, 'different_label', 0.6);
      narrative.addRelation(relation);
      narrative.addRelation(relation2);
      
      const relatesTo = narrative.getRelationsByLabel('relates_to');
      expect(relatesTo).toHaveLength(1);
      expect(relatesTo[0]).toBe(relation);
    });
  });

  describe('toJSON', () => {
    it('should serialize to JSON', () => {
      const entity = new Entity('test entity', [{ start: 0, end: 4, text: 'test' }]);
      narrative.addEntity(entity);
      
      const json = narrative.toJSON();
      expect(json.id).toBe(narrative.id);
      expect(json.text).toBe(narrative.text);
      expect(json.entities).toHaveLength(1);
      expect(json.createdAt).toEqual(narrative.createdAt);
      expect(json.updatedAt).toEqual(narrative.updatedAt);
    });
  });
});