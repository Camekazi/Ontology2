"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MermaidRenderer = void 0;
const DefaultTaxonomy_1 = require("../taxonomy/DefaultTaxonomy");
class MermaidRenderer {
    constructor(options) {
        this.options = {
            direction: 'TD',
            includeColors: true,
            maxNodes: 50,
            includeLabels: true,
            nodeShape: 'rounded',
            ...options
        };
    }
    renderOntology(ontology) {
        const nodes = this.limitNodes(ontology.nodes);
        const edges = ontology.edges.filter(edge => nodes.some(n => n.id === edge.source) &&
            nodes.some(n => n.id === edge.target));
        let mermaid = `flowchart ${this.options.direction}\n`;
        // Add nodes
        for (const node of nodes) {
            mermaid += this.renderNode(node);
        }
        // Add edges
        for (const edge of edges) {
            mermaid += this.renderEdge(edge);
        }
        // Add styling if colors are enabled
        if (this.options.includeColors) {
            mermaid += this.renderStyling(nodes);
        }
        return mermaid;
    }
    renderSimpleGraph(entities, relations) {
        let mermaid = `flowchart ${this.options.direction}\n`;
        // Add entities as nodes
        for (const entity of entities) {
            const nodeId = this.sanitizeNodeId(entity);
            const nodeLabel = this.sanitizeLabel(entity);
            mermaid += `    ${nodeId}["${nodeLabel}"]\n`;
        }
        // Add relations as edges
        for (const relation of relations) {
            const sourceId = this.sanitizeNodeId(relation.source);
            const targetId = this.sanitizeNodeId(relation.target);
            const label = this.sanitizeLabel(relation.label);
            if (this.options.includeLabels) {
                mermaid += `    ${sourceId} -->|"${label}"| ${targetId}\n`;
            }
            else {
                mermaid += `    ${sourceId} --> ${targetId}\n`;
            }
        }
        return mermaid;
    }
    limitNodes(nodes) {
        if (!this.options.maxNodes || nodes.length <= this.options.maxNodes) {
            return nodes;
        }
        // Prioritize nodes by type importance and connections
        const sortedNodes = [...nodes].sort((a, b) => {
            const aImportance = this.getNodeImportance(a);
            const bImportance = this.getNodeImportance(b);
            return bImportance - aImportance;
        });
        return sortedNodes.slice(0, this.options.maxNodes);
    }
    getNodeImportance(node) {
        // Assign importance based on node type
        const typeImportance = {
            'goal': 10,
            'outcome': 9,
            'initiative': 8,
            'metric': 7,
            'stakeholder': 6,
            'time-period': 5,
            'process': 4,
            'resource': 3,
            'insight': 2,
            'principle': 1
        };
        return typeImportance[node.type] || 0;
    }
    renderNode(node) {
        const nodeId = this.sanitizeNodeId(node.id);
        const label = this.sanitizeLabel(node.label);
        let nodeDefinition;
        switch (this.options.nodeShape) {
            case 'rectangle':
                nodeDefinition = `["${label}"]`;
                break;
            case 'rounded':
                nodeDefinition = `("${label}")`;
                break;
            case 'circle':
                nodeDefinition = `(("${label}"))`;
                break;
            case 'rhombus':
                nodeDefinition = `{"${label}"}`;
                break;
            default:
                nodeDefinition = `["${label}"]`;
        }
        return `    ${nodeId}${nodeDefinition}\n`;
    }
    renderEdge(edge) {
        const sourceId = this.sanitizeNodeId(edge.source);
        const targetId = this.sanitizeNodeId(edge.target);
        const label = this.sanitizeLabel(edge.label);
        if (this.options.includeLabels && label) {
            return `    ${sourceId} -->|"${label}"| ${targetId}\n`;
        }
        else {
            return `    ${sourceId} --> ${targetId}\n`;
        }
    }
    renderStyling(nodes) {
        let styling = '\n';
        // Group nodes by type for styling
        const nodesByType = new Map();
        for (const node of nodes) {
            const nodeId = this.sanitizeNodeId(node.id);
            if (!nodesByType.has(node.type)) {
                nodesByType.set(node.type, []);
            }
            nodesByType.get(node.type).push(nodeId);
        }
        // Apply styling for each type
        for (const [type, nodeIds] of nodesByType) {
            const color = this.getTypeColor(type);
            if (color) {
                const classId = `class${type.replace(/[^a-zA-Z0-9]/g, '')}`;
                styling += `    classDef ${classId} fill:${color},stroke:#333,stroke-width:2px,color:#000\n`;
                styling += `    class ${nodeIds.join(',')} ${classId}\n`;
            }
        }
        return styling;
    }
    getTypeColor(type) {
        const taxonomyClass = DefaultTaxonomy_1.DEFAULT_TAXONOMY_CLASSES.find(tc => tc.id === type);
        return taxonomyClass?.color || null;
    }
    sanitizeNodeId(id) {
        // Convert to valid Mermaid node ID
        return id.replace(/[^a-zA-Z0-9_]/g, '_');
    }
    sanitizeLabel(label) {
        // Escape quotes and limit length
        const maxLength = 30;
        let sanitized = label.replace(/"/g, '\\"');
        if (sanitized.length > maxLength) {
            sanitized = sanitized.substring(0, maxLength - 3) + '...';
        }
        return sanitized;
    }
    renderLegend() {
        if (!this.options.includeColors) {
            return '';
        }
        let legend = '\n%% Legend\n';
        legend += 'subgraph Legend\n';
        for (const taxonomyClass of DefaultTaxonomy_1.DEFAULT_TAXONOMY_CLASSES) {
            const nodeId = `legend_${taxonomyClass.id.replace(/[^a-zA-Z0-9]/g, '_')}`;
            legend += `    ${nodeId}["${taxonomyClass.name}"]\n`;
        }
        legend += 'end\n\n';
        // Add styling for legend
        for (const taxonomyClass of DefaultTaxonomy_1.DEFAULT_TAXONOMY_CLASSES) {
            const nodeId = `legend_${taxonomyClass.id.replace(/[^a-zA-Z0-9]/g, '_')}`;
            const classId = `legend${taxonomyClass.id.replace(/[^a-zA-Z0-9]/g, '')}`;
            legend += `classDef ${classId} fill:${taxonomyClass.color},stroke:#333,stroke-width:2px,color:#000\n`;
            legend += `class ${nodeId} ${classId}\n`;
        }
        return legend;
    }
    renderWithLegend(ontology) {
        const mainGraph = this.renderOntology(ontology);
        const legend = this.renderLegend();
        return mainGraph + legend;
    }
}
exports.MermaidRenderer = MermaidRenderer;
//# sourceMappingURL=MermaidRenderer.js.map