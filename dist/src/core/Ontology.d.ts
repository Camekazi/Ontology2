import { Ontology as IOntology, OntologyNode, OntologyEdge, Narrative } from './types';
export declare class Ontology implements IOntology {
    id: string;
    nodes: OntologyNode[];
    edges: OntologyEdge[];
    metadata?: Record<string, any>;
    createdAt: Date;
    constructor(id?: string, metadata?: Record<string, any>);
    private generateId;
    static fromNarrative(narrative: Narrative): Ontology;
    addNode(node: OntologyNode): void;
    addEdge(edge: OntologyEdge): void;
    getNode(id: string): OntologyNode | undefined;
    getEdge(id: string): OntologyEdge | undefined;
    getNodesByType(type: string): OntologyNode[];
    getEdgesByLabel(label: string): OntologyEdge[];
    getConnectedNodes(nodeId: string): OntologyNode[];
    toJSON(): IOntology;
}
//# sourceMappingURL=Ontology.d.ts.map