"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ontology = void 0;
class Ontology {
    constructor(id, metadata) {
        this.nodes = [];
        this.edges = [];
        this.id = id || this.generateId();
        this.metadata = metadata;
        this.createdAt = new Date();
    }
    generateId() {
        return `ontology-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    static fromNarrative(narrative) {
        const ontology = new Ontology();
        if (narrative.entities) {
            narrative.entities.forEach(entity => {
                ontology.addNode({
                    id: entity.id,
                    label: entity.text,
                    type: entity.classification?.type || 'Entity',
                    attributes: {
                        ...entity.attributes,
                        originalSpans: entity.spans,
                        confidence: entity.classification?.confidence
                    }
                });
            });
        }
        if (narrative.relations) {
            narrative.relations.forEach(relation => {
                ontology.addEdge({
                    id: relation.id,
                    source: relation.sourceEntityId,
                    target: relation.targetEntityId,
                    label: relation.label,
                    attributes: {
                        confidence: relation.confidence,
                        ...relation.metadata
                    }
                });
            });
        }
        ontology.metadata = {
            sourceNarrativeId: narrative.id,
            extractedAt: new Date(),
            entityCount: narrative.entities?.length || 0,
            relationCount: narrative.relations?.length || 0
        };
        return ontology;
    }
    addNode(node) {
        this.nodes.push(node);
    }
    addEdge(edge) {
        this.edges.push(edge);
    }
    getNode(id) {
        return this.nodes.find(n => n.id === id);
    }
    getEdge(id) {
        return this.edges.find(e => e.id === id);
    }
    getNodesByType(type) {
        return this.nodes.filter(n => n.type === type);
    }
    getEdgesByLabel(label) {
        return this.edges.filter(e => e.label === label);
    }
    getConnectedNodes(nodeId) {
        const connectedIds = new Set();
        this.edges.forEach(edge => {
            if (edge.source === nodeId) {
                connectedIds.add(edge.target);
            }
            if (edge.target === nodeId) {
                connectedIds.add(edge.source);
            }
        });
        return this.nodes.filter(node => connectedIds.has(node.id));
    }
    toJSON() {
        return {
            id: this.id,
            nodes: this.nodes,
            edges: this.edges,
            metadata: this.metadata,
            createdAt: this.createdAt
        };
    }
}
exports.Ontology = Ontology;
//# sourceMappingURL=Ontology.js.map