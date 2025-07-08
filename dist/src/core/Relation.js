"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Relation = void 0;
class Relation {
    constructor(sourceEntityId, targetEntityId, label, confidence = 1.0, id, metadata) {
        this.id = id || this.generateId();
        this.sourceEntityId = sourceEntityId;
        this.targetEntityId = targetEntityId;
        this.label = label;
        this.confidence = Math.max(0, Math.min(1, confidence));
        this.metadata = metadata;
    }
    generateId() {
        return `relation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    setConfidence(confidence) {
        this.confidence = Math.max(0, Math.min(1, confidence));
    }
    getMetadata(key) {
        return this.metadata?.[key];
    }
    setMetadata(key, value) {
        if (!this.metadata) {
            this.metadata = {};
        }
        this.metadata[key] = value;
    }
    isHighConfidence(threshold = 0.8) {
        return this.confidence >= threshold;
    }
    toJSON() {
        return {
            id: this.id,
            sourceEntityId: this.sourceEntityId,
            targetEntityId: this.targetEntityId,
            label: this.label,
            confidence: this.confidence,
            metadata: this.metadata
        };
    }
}
exports.Relation = Relation;
//# sourceMappingURL=Relation.js.map