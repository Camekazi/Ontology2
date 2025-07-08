"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OntologyExporter = void 0;
class OntologyExporter {
    toJsonLD(ontology) {
        const context = {
            'rdfs': 'http://www.w3.org/2000/01/rdf-schema#',
            'dotwork': 'https://dotwork.com/ontology#',
            'label': 'rdfs:label',
            'type': '@type',
            'id': '@id'
        };
        const graph = [];
        // Convert nodes
        for (const node of ontology.nodes) {
            const jsonLdNode = {
                '@id': `dotwork:${node.id}`,
                '@type': `dotwork:${node.type}`,
                'rdfs:label': node.label
            };
            // Add custom attributes
            if (node.attributes) {
                for (const [key, value] of Object.entries(node.attributes)) {
                    jsonLdNode[`dotwork:${key}`] = value;
                }
            }
            graph.push(jsonLdNode);
        }
        // Convert edges as relationships
        for (const edge of ontology.edges) {
            const sourceNode = graph.find(n => n['@id'] === `dotwork:${edge.source}`);
            if (sourceNode) {
                const relationshipKey = `dotwork:${edge.label}`;
                if (!sourceNode[relationshipKey]) {
                    sourceNode[relationshipKey] = [];
                }
                if (Array.isArray(sourceNode[relationshipKey])) {
                    sourceNode[relationshipKey].push({
                        '@id': `dotwork:${edge.target}`
                    });
                }
            }
        }
        return {
            '@context': context,
            '@graph': graph
        };
    }
    toGraphML(ontology) {
        const doc = this.prepareGraphMLDocument(ontology);
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<graphml xmlns="http://graphml.graphdrawing.org/xmlns" ';
        xml += 'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ';
        xml += 'xsi:schemaLocation="http://graphml.graphdrawing.org/xmlns ';
        xml += 'http://graphml.graphdrawing.org/xmlns/1.0/graphml.xsd">\n';
        // Add key definitions
        for (const key of doc.keys) {
            xml += `  <key id="${key.id}" for="${key.for}" attr.name="${key.name}" attr.type="${key.type}"/>\n`;
        }
        xml += '  <graph id="ontology" edgedefault="directed">\n';
        // Add nodes
        for (const node of doc.nodes) {
            xml += `    <node id="${node.id}">\n`;
            for (const data of node.data) {
                xml += `      <data key="${data.key}">${this.escapeXml(data.value)}</data>\n`;
            }
            xml += '    </node>\n';
        }
        // Add edges
        for (const edge of doc.edges) {
            xml += `    <edge id="${edge.id}" source="${edge.source}" target="${edge.target}">\n`;
            for (const data of edge.data) {
                xml += `      <data key="${data.key}">${this.escapeXml(data.value)}</data>\n`;
            }
            xml += '    </edge>\n';
        }
        xml += '  </graph>\n';
        xml += '</graphml>';
        return xml;
    }
    toCytoscape(ontology) {
        const elements = [];
        // Add nodes
        for (const node of ontology.nodes) {
            elements.push({
                data: {
                    id: node.id,
                    label: node.label,
                    type: node.type,
                    ...node.attributes
                }
            });
        }
        // Add edges
        for (const edge of ontology.edges) {
            elements.push({
                data: {
                    id: edge.id,
                    source: edge.source,
                    target: edge.target,
                    label: edge.label,
                    ...edge.attributes
                }
            });
        }
        return {
            elements,
            style: this.getCytoscapeStyle(),
            layout: {
                name: 'cose',
                idealEdgeLength: 100,
                nodeOverlap: 20,
                refresh: 20,
                fit: true,
                padding: 30,
                randomize: false,
                componentSpacing: 100
            }
        };
    }
    toGEXF(ontology) {
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<gexf xmlns="http://www.gexf.net/1.2draft" version="1.2">\n';
        xml += '  <meta lastmodifieddate="' + new Date().toISOString() + '">\n';
        xml += '    <creator>Dotwork Narrative-to-Ontology</creator>\n';
        xml += '    <description>Ontology extracted from narrative</description>\n';
        xml += '  </meta>\n';
        xml += '  <graph mode="static" defaultedgetype="directed">\n';
        // Define attributes
        xml += '    <attributes class="node">\n';
        xml += '      <attribute id="0" title="type" type="string"/>\n';
        xml += '      <attribute id="1" title="label" type="string"/>\n';
        xml += '    </attributes>\n';
        xml += '    <attributes class="edge">\n';
        xml += '      <attribute id="0" title="label" type="string"/>\n';
        xml += '    </attributes>\n';
        // Add nodes
        xml += '    <nodes>\n';
        for (const node of ontology.nodes) {
            xml += `      <node id="${node.id}" label="${this.escapeXml(node.label)}">\n`;
            xml += '        <attvalues>\n';
            xml += `          <attvalue for="0" value="${this.escapeXml(node.type)}"/>\n`;
            xml += `          <attvalue for="1" value="${this.escapeXml(node.label)}"/>\n`;
            xml += '        </attvalues>\n';
            xml += '      </node>\n';
        }
        xml += '    </nodes>\n';
        // Add edges
        xml += '    <edges>\n';
        for (const edge of ontology.edges) {
            xml += `      <edge id="${edge.id}" source="${edge.source}" target="${edge.target}">\n`;
            xml += '        <attvalues>\n';
            xml += `          <attvalue for="0" value="${this.escapeXml(edge.label)}"/>\n`;
            xml += '        </attvalues>\n';
            xml += '      </edge>\n';
        }
        xml += '    </edges>\n';
        xml += '  </graph>\n';
        xml += '</gexf>';
        return xml;
    }
    prepareGraphMLDocument(ontology) {
        const keys = [
            { id: 'label', for: 'node', type: 'string', name: 'Label' },
            { id: 'type', for: 'node', type: 'string', name: 'Type' },
            { id: 'label', for: 'edge', type: 'string', name: 'Label' }
        ];
        const nodes = ontology.nodes.map(node => ({
            id: node.id,
            data: [
                { key: 'label', value: node.label },
                { key: 'type', value: node.type }
            ]
        }));
        const edges = ontology.edges.map(edge => ({
            id: edge.id,
            source: edge.source,
            target: edge.target,
            data: [
                { key: 'label', value: edge.label }
            ]
        }));
        return { nodes, edges, keys };
    }
    getCytoscapeStyle() {
        return [
            {
                selector: 'node',
                style: {
                    'background-color': 'data(color)',
                    'label': 'data(label)',
                    'text-wrap': 'wrap',
                    'text-max-width': '100px',
                    'font-size': '12px',
                    'text-valign': 'center',
                    'text-halign': 'center',
                    'width': '60px',
                    'height': '60px'
                }
            },
            {
                selector: 'edge',
                style: {
                    'width': 2,
                    'line-color': '#ccc',
                    'target-arrow-color': '#ccc',
                    'target-arrow-shape': 'triangle',
                    'curve-style': 'bezier',
                    'label': 'data(label)',
                    'font-size': '10px',
                    'text-rotation': 'autorotate'
                }
            }
        ];
    }
    escapeXml(text) {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }
}
exports.OntologyExporter = OntologyExporter;
//# sourceMappingURL=ExportFormats.js.map