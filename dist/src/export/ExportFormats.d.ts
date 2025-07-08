import { Ontology } from '../core/types';
export interface JsonLdContext {
    [key: string]: string | object;
}
export interface JsonLdNode {
    '@id': string;
    '@type': string;
    'rdfs:label'?: string;
    [key: string]: any;
}
export interface JsonLdGraph {
    '@context': JsonLdContext;
    '@graph': JsonLdNode[];
}
export interface GraphMLNode {
    id: string;
    data: Array<{
        key: string;
        value: string;
    }>;
}
export interface GraphMLEdge {
    id: string;
    source: string;
    target: string;
    data: Array<{
        key: string;
        value: string;
    }>;
}
export interface GraphMLDocument {
    nodes: GraphMLNode[];
    edges: GraphMLEdge[];
    keys: Array<{
        id: string;
        for: 'node' | 'edge';
        type: string;
        name: string;
    }>;
}
export declare class OntologyExporter {
    toJsonLD(ontology: Ontology): JsonLdGraph;
    toGraphML(ontology: Ontology): string;
    toCytoscape(ontology: Ontology): object;
    toGEXF(ontology: Ontology): string;
    private prepareGraphMLDocument;
    private getCytoscapeStyle;
    private escapeXml;
}
//# sourceMappingURL=ExportFormats.d.ts.map