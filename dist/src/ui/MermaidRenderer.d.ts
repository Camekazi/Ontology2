import { Ontology } from '../core/types';
export interface MermaidOptions {
    direction?: 'TD' | 'TB' | 'BT' | 'RL' | 'LR';
    includeColors?: boolean;
    maxNodes?: number;
    includeLabels?: boolean;
    nodeShape?: 'rectangle' | 'rounded' | 'circle' | 'rhombus';
}
export declare class MermaidRenderer {
    private options;
    constructor(options?: MermaidOptions);
    renderOntology(ontology: Ontology): string;
    renderSimpleGraph(entities: string[], relations: Array<{
        source: string;
        target: string;
        label: string;
    }>): string;
    private limitNodes;
    private getNodeImportance;
    private renderNode;
    private renderEdge;
    private renderStyling;
    private getTypeColor;
    private sanitizeNodeId;
    private sanitizeLabel;
    renderLegend(): string;
    renderWithLegend(ontology: Ontology): string;
}
//# sourceMappingURL=MermaidRenderer.d.ts.map