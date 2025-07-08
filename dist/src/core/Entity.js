"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Entity = void 0;
class Entity {
    constructor(text, spans, id, classification, attributes) {
        this.id = id || this.generateId();
        this.text = text;
        this.spans = spans;
        this.classification = classification;
        this.attributes = attributes;
    }
    generateId() {
        return `entity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    setClassification(classification) {
        this.classification = classification;
    }
    getAttribute(key) {
        return this.attributes?.[key];
    }
    setAttribute(key, value) {
        if (!this.attributes) {
            this.attributes = {};
        }
        this.attributes[key] = value;
    }
    getFirstSpan() {
        return this.spans[0];
    }
    getTotalLength() {
        return this.spans.reduce((total, span) => total + (span.end - span.start), 0);
    }
    toJSON() {
        return {
            id: this.id,
            text: this.text,
            spans: this.spans,
            classification: this.classification,
            attributes: this.attributes
        };
    }
}
exports.Entity = Entity;
//# sourceMappingURL=Entity.js.map