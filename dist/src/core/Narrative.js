"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Narrative = void 0;
class Narrative {
    constructor(text, id, metadata) {
        this.entities = [];
        this.relations = [];
        this.id = id || this.generateId();
        this.text = text;
        this.metadata = metadata;
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }
    generateId() {
        return `narrative-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    addEntity(entity) {
        this.entities.push(entity);
        this.updatedAt = new Date();
    }
    addRelation(relation) {
        this.relations.push(relation);
        this.updatedAt = new Date();
    }
    getEntity(id) {
        return this.entities.find(e => e.id === id);
    }
    getRelation(id) {
        return this.relations.find(r => r.id === id);
    }
    getEntitiesByType(type) {
        return this.entities.filter(e => e.classification?.type === type);
    }
    getRelationsByLabel(label) {
        return this.relations.filter(r => r.label === label);
    }
    toJSON() {
        return {
            id: this.id,
            text: this.text,
            metadata: this.metadata,
            entities: this.entities,
            relations: this.relations,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}
exports.Narrative = Narrative;
//# sourceMappingURL=Narrative.js.map