import nlp from 'compromise';
import { Entity as EntityClass } from '../core/Entity';
import { TextSpan } from '../core/types';
import { DefaultTaxonomy } from '../taxonomy/DefaultTaxonomy';

export interface ExtractionOptions {
  minEntityLength?: number;
  maxEntityLength?: number;
  includePronouns?: boolean;
  customPatterns?: string[];
}

export class EntityExtractor {
  private taxonomy: DefaultTaxonomy;
  private options: ExtractionOptions;

  constructor(taxonomy?: DefaultTaxonomy, options?: ExtractionOptions) {
    this.taxonomy = taxonomy || new DefaultTaxonomy();
    this.options = {
      minEntityLength: 2,
      maxEntityLength: 50,
      includePronouns: false,
      customPatterns: [],
      ...options
    };
  }

  public extractEntities(text: string): EntityClass[] {
    const entities: EntityClass[] = [];
    
    // Use compromise.js for NLP processing
    const doc = nlp(text);
    
    // Extract noun phrases
    const nouns = doc.nouns().json();
    for (const noun of nouns) {
      if (this.isValidEntity(noun.text)) {
        const spans = this.findTextSpans(text, noun.text);
        if (spans.length > 0) {
          const entity = new EntityClass(noun.text, spans);
          this.classifyEntity(entity);
          entities.push(entity);
        }
      }
    }

    // Extract named entities (people, places, organizations)
    const people = doc.people().json();
    for (const person of people) {
      if (this.isValidEntity(person.text)) {
        const spans = this.findTextSpans(text, person.text);
        if (spans.length > 0) {
          const entity = new EntityClass(person.text, spans);
          entity.setClassification({
            type: 'stakeholder',
            confidence: 0.9,
            metadata: { entityType: 'person' }
          });
          entities.push(entity);
        }
      }
    }

    const places = doc.places().json();
    for (const place of places) {
      if (this.isValidEntity(place.text)) {
        const spans = this.findTextSpans(text, place.text);
        if (spans.length > 0) {
          const entity = new EntityClass(place.text, spans);
          this.classifyEntity(entity);
          entities.push(entity);
        }
      }
    }

    const organizations = doc.organizations().json();
    for (const org of organizations) {
      if (this.isValidEntity(org.text)) {
        const spans = this.findTextSpans(text, org.text);
        if (spans.length > 0) {
          const entity = new EntityClass(org.text, spans);
          entity.setClassification({
            type: 'stakeholder',
            confidence: 0.8,
            metadata: { entityType: 'organization' }
          });
          entities.push(entity);
        }
      }
    }

    // Extract custom patterns
    if (this.options.customPatterns) {
      for (const pattern of this.options.customPatterns) {
        const regex = new RegExp(pattern, 'gi');
        let match;
        while ((match = regex.exec(text)) !== null) {
          const entityText = match[0];
          if (this.isValidEntity(entityText)) {
            const spans = [{
              start: match.index,
              end: match.index + entityText.length,
              text: entityText
            }];
            const entity = new EntityClass(entityText, spans);
            this.classifyEntity(entity);
            entities.push(entity);
          }
        }
      }
    }

    // Remove duplicates and overlapping entities
    return this.deduplicateEntities(entities);
  }

  private isValidEntity(text: string): boolean {
    const trimmed = text.trim();
    
    if (trimmed.length < (this.options.minEntityLength || 2)) {
      return false;
    }
    
    if (trimmed.length > (this.options.maxEntityLength || 50)) {
      return false;
    }

    // Filter out common stopwords and pronouns
    const stopwords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    const pronouns = ['i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them'];
    
    const lowerText = trimmed.toLowerCase();
    
    if (stopwords.includes(lowerText)) {
      return false;
    }
    
    if (!this.options.includePronouns && pronouns.includes(lowerText)) {
      return false;
    }

    return true;
  }

  private findTextSpans(text: string, entityText: string): TextSpan[] {
    const spans: TextSpan[] = [];
    const regex = new RegExp(this.escapeRegExp(entityText), 'gi');
    let match;
    
    while ((match = regex.exec(text)) !== null) {
      spans.push({
        start: match.index,
        end: match.index + entityText.length,
        text: entityText
      });
    }
    
    return spans;
  }

  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private classifyEntity(entity: EntityClass): void {
    const classification = this.taxonomy.classifyText(entity.text);
    if (classification) {
      entity.setClassification({
        type: classification.class.id,
        confidence: classification.confidence,
        metadata: {
          taxonomyClass: classification.class.name,
          description: classification.class.description
        }
      });
    }
  }

  private deduplicateEntities(entities: EntityClass[]): EntityClass[] {
    const seen = new Set<string>();
    const deduplicated: EntityClass[] = [];
    
    // Sort by length (longer entities first) to prefer more specific entities
    entities.sort((a, b) => b.text.length - a.text.length);
    
    for (const entity of entities) {
      const key = `${entity.text.toLowerCase()}`;
      if (!seen.has(key)) {
        seen.add(key);
        deduplicated.push(entity);
      }
    }
    
    return deduplicated;
  }
}