import { Ontology as IOntology, OntologyNode, OntologyEdge, Narrative } from './types';

export class Ontology implements IOntology {
  public id: string;
  public nodes: OntologyNode[] = [];
  public edges: OntologyEdge[] = [];
  public metadata?: Record<string, any>;
  public createdAt: Date;

  constructor(id?: string, metadata?: Record<string, any>) {
    this.id = id || this.generateId();
    this.metadata = metadata;
    this.createdAt = new Date();
  }

  private generateId(): string {
    return `ontology-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  public static fromNarrative(narrative: Narrative): Ontology {
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

  public addNode(node: OntologyNode): void {
    this.nodes.push(node);
  }

  public addEdge(edge: OntologyEdge): void {
    this.edges.push(edge);
  }

  public getNode(id: string): OntologyNode | undefined {
    return this.nodes.find(n => n.id === id);
  }

  public getEdge(id: string): OntologyEdge | undefined {
    return this.edges.find(e => e.id === id);
  }

  public getNodesByType(type: string): OntologyNode[] {
    return this.nodes.filter(n => n.type === type);
  }

  public getEdgesByLabel(label: string): OntologyEdge[] {
    return this.edges.filter(e => e.label === label);
  }

  public getConnectedNodes(nodeId: string): OntologyNode[] {
    const connectedIds = new Set<string>();
    
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

  public toJSON(): IOntology {
    return {
      id: this.id,
      nodes: this.nodes,
      edges: this.edges,
      metadata: this.metadata,
      createdAt: this.createdAt
    };
  }
}