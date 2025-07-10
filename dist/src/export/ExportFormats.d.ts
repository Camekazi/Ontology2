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
export declare class OntologyExporter {
    toJsonLD(ontology: Ontology): JsonLdGraph;
    toCytoscape(ontology: Ontology): object;
    private getCytoscapeStyle;
    toCSV(ontology: Ontology): {
        nodes: string;
        edges: string;
    };
}
//# sourceMappingURL=ExportFormats.d.ts.map