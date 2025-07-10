"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelationExtractor = void 0;
const compromise_1 = __importDefault(require("compromise"));
const Relation_1 = require("../core/Relation");
class RelationExtractor {
    constructor(options) {
        this.options = {
            maxDistance: 100,
            minConfidence: 0.3,
            customPatterns: [],
            ...options
        };
        this.defaultPatterns = [
            // Temporal relations
            { pattern: /\b(during|in|throughout)\b/i, label: 'occurs_during', confidence: 0.8, direction: 'forward' },
            { pattern: /\b(after|following|subsequent to)\b/i, label: 'follows', confidence: 0.7, direction: 'forward' },
            { pattern: /\b(before|prior to|preceding)\b/i, label: 'precedes', confidence: 0.7, direction: 'forward' },
            // Causal relations
            { pattern: /\b(caused by|due to|because of|resulted from)\b/i, label: 'caused_by', confidence: 0.8, direction: 'backward' },
            { pattern: /\b(led to|resulted in|caused|enabled)\b/i, label: 'causes', confidence: 0.8, direction: 'forward' },
            { pattern: /\b(improved|enhanced|increased)\b/i, label: 'improves', confidence: 0.6, direction: 'forward' },
            // Organizational relations
            { pattern: /\b(part of|member of|within|belongs to)\b/i, label: 'part_of', confidence: 0.7, direction: 'forward' },
            { pattern: /\b(includes|contains|comprises)\b/i, label: 'contains', confidence: 0.7, direction: 'forward' },
            { pattern: /\b(managed by|led by|under)\b/i, label: 'managed_by', confidence: 0.8, direction: 'forward' },
            // Dependency relations
            { pattern: /\b(depends on|relies on|requires)\b/i, label: 'depends_on', confidence: 0.8, direction: 'forward' },
            { pattern: /\b(supports|enables|facilitates)\b/i, label: 'supports', confidence: 0.7, direction: 'forward' },
            // Measurement relations
            { pattern: /\b(measured by|tracked by|indicated by)\b/i, label: 'measured_by', confidence: 0.8, direction: 'forward' },
            { pattern: /\b(measures|tracks|indicates)\b/i, label: 'measures', confidence: 0.8, direction: 'backward' },
            // Implementation relations
            { pattern: /\b(implemented through|achieved via|using)\b/i, label: 'implemented_through', confidence: 0.7, direction: 'forward' },
            { pattern: /\b(focuses on|targets|addresses)\b/i, label: 'focuses_on', confidence: 0.6, direction: 'forward' },
            // Association relations (weaker)
            { pattern: /\b(with|and|along with|together with)\b/i, label: 'associated_with', confidence: 0.4, direction: 'bidirectional' },
            { pattern: /\b(related to|connected to|linked to)\b/i, label: 'related_to', confidence: 0.5, direction: 'bidirectional' }
        ];
    }
    extractRelations(text, entities) {
        const relations = [];
        const allPatterns = [...this.defaultPatterns, ...(this.options.customPatterns || [])];
        // Process text with NLP
        const doc = (0, compromise_1.default)(text);
        const sentences = doc.sentences().json();
        for (const sentence of sentences) {
            const sentenceText = sentence.text;
            const sentenceStart = text.indexOf(sentenceText);
            // Find entities in this sentence
            const sentenceEntities = entities.filter(entity => entity.spans.some(span => span.start >= sentenceStart &&
                span.end <= sentenceStart + sentenceText.length));
            if (sentenceEntities.length < 2)
                continue;
            // Look for relation patterns between entities
            for (let i = 0; i < sentenceEntities.length; i++) {
                for (let j = i + 1; j < sentenceEntities.length; j++) {
                    const entity1 = sentenceEntities[i];
                    const entity2 = sentenceEntities[j];
                    const extractedRelations = this.findRelationsBetweenEntities(sentenceText, entity1, entity2, allPatterns, sentenceStart);
                    relations.push(...extractedRelations);
                }
            }
        }
        // Filter by confidence threshold
        return relations.filter(relation => relation.confidence >= (this.options.minConfidence || 0.3));
    }
    createEntityPositionMap(entities) {
        const map = new Map();
        for (const entity of entities) {
            map.set(entity.id, entity.spans.map(span => ({ start: span.start, end: span.end })));
        }
        return map;
    }
    findRelationsBetweenEntities(text, entity1, entity2, patterns, textOffset = 0) {
        const relations = [];
        // Get entity positions in the text
        const entity1Positions = entity1.spans.map(span => ({
            start: span.start - textOffset,
            end: span.end - textOffset
        }));
        const entity2Positions = entity2.spans.map(span => ({
            start: span.start - textOffset,
            end: span.end - textOffset
        }));
        for (const pos1 of entity1Positions) {
            for (const pos2 of entity2Positions) {
                // Ensure entities are within max distance
                const distance = Math.abs(pos1.start - pos2.start);
                if (distance > (this.options.maxDistance || 100))
                    continue;
                // Determine order
                const isEntity1First = pos1.start < pos2.start;
                const firstEntity = isEntity1First ? entity1 : entity2;
                const secondEntity = isEntity1First ? entity2 : entity1;
                const firstPos = isEntity1First ? pos1 : pos2;
                const secondPos = isEntity1First ? pos2 : pos1;
                // Extract text between entities
                const betweenStart = firstPos.end;
                const betweenEnd = secondPos.start;
                const betweenText = text.substring(betweenStart, betweenEnd);
                // Check for relation patterns
                for (const pattern of patterns) {
                    const match = pattern.pattern.exec(betweenText);
                    if (match) {
                        const relation = this.createRelation(firstEntity, secondEntity, pattern, match, betweenText);
                        if (relation) {
                            relations.push(relation);
                        }
                    }
                }
            }
        }
        return relations;
    }
    createRelation(entity1, entity2, pattern, match, context) {
        let sourceId;
        let targetId;
        let label;
        switch (pattern.direction) {
            case 'forward':
                sourceId = entity1.id;
                targetId = entity2.id;
                label = pattern.label;
                break;
            case 'backward':
                sourceId = entity2.id;
                targetId = entity1.id;
                label = pattern.label;
                break;
            case 'bidirectional':
                // Create bidirectional relation (we'll create one direction here)
                sourceId = entity1.id;
                targetId = entity2.id;
                label = pattern.label;
                break;
            default:
                return null;
        }
        // Adjust confidence based on context
        let adjustedConfidence = pattern.confidence;
        // Boost confidence for stronger linguistic cues
        const strongCues = ['because', 'caused by', 'resulted in', 'led to', 'due to'];
        if (strongCues.some(cue => context.toLowerCase().includes(cue))) {
            adjustedConfidence = Math.min(1.0, adjustedConfidence + 0.1);
        }
        // Reduce confidence for weaker context
        if (context.trim().length > 50) {
            adjustedConfidence *= 0.9;
        }
        const relation = new Relation_1.Relation(sourceId, targetId, label, adjustedConfidence, undefined, {
            patternMatch: match[0],
            context: context.trim(),
            extractionMethod: 'linguistic_pattern'
        });
        return relation;
    }
    addCustomPattern(pattern) {
        if (!this.options.customPatterns) {
            this.options.customPatterns = [];
        }
        this.options.customPatterns.push(pattern);
    }
    getAvailablePatterns() {
        return [...this.defaultPatterns, ...(this.options.customPatterns || [])];
    }
}
exports.RelationExtractor = RelationExtractor;
//# sourceMappingURL=RelationExtractor.js.map