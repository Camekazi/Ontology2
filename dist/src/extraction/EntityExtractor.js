"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityExtractor = void 0;
const compromise_1 = __importDefault(require("compromise"));
const Entity_1 = require("../core/Entity");
const DefaultTaxonomy_1 = require("../taxonomy/DefaultTaxonomy");
class EntityExtractor {
    constructor(taxonomy, options) {
        this.taxonomy = taxonomy || new DefaultTaxonomy_1.DefaultTaxonomy();
        this.options = {
            minEntityLength: 2,
            maxEntityLength: 50,
            includePronouns: false,
            customPatterns: [],
            ...options
        };
    }
    extractEntities(text) {
        const entities = [];
        // Use compromise.js for NLP processing
        const doc = (0, compromise_1.default)(text);
        // Extract noun phrases
        const nouns = doc.nouns().json();
        for (const noun of nouns) {
            if (this.isValidEntity(noun.text)) {
                const spans = this.findTextSpans(text, noun.text);
                if (spans.length > 0) {
                    const entity = new Entity_1.Entity(noun.text, spans);
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
                    const entity = new Entity_1.Entity(person.text, spans);
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
                    const entity = new Entity_1.Entity(place.text, spans);
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
                    const entity = new Entity_1.Entity(org.text, spans);
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
                        const entity = new Entity_1.Entity(entityText, spans);
                        this.classifyEntity(entity);
                        entities.push(entity);
                    }
                }
            }
        }
        // Remove duplicates and overlapping entities
        return this.deduplicateEntities(entities);
    }
    isValidEntity(text) {
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
    findTextSpans(text, entityText) {
        const spans = [];
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
    escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    classifyEntity(entity) {
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
    deduplicateEntities(entities) {
        const seen = new Set();
        const deduplicated = [];
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
exports.EntityExtractor = EntityExtractor;
//# sourceMappingURL=EntityExtractor.js.map