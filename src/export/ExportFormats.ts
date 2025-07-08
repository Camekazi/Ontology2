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


export class OntologyExporter {
  
  public toJsonLD(ontology: Ontology): JsonLdGraph {
    const context: JsonLdContext = {
      'rdfs': 'http://www.w3.org/2000/01/rdf-schema#',
      'dotwork': 'https://dotwork.com/ontology#',
      'label': 'rdfs:label',
      'type': '@type',
      'id': '@id'
    };

    const graph: JsonLdNode[] = [];

    // Convert nodes
    for (const node of ontology.nodes) {
      const jsonLdNode: JsonLdNode = {
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


  public toCytoscape(ontology: Ontology): object {
    const elements: any[] = [];

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



  private getCytoscapeStyle(): any[] {
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

  public toCSV(ontology: Ontology): { nodes: string; edges: string } {
    // Export nodes CSV
    let nodesCsv = 'id,label,type\n';
    for (const node of ontology.nodes) {
      const label = node.label.replace(/"/g, '""'); // Escape quotes
      nodesCsv += `"${node.id}","${label}","${node.type}"\n`;
    }

    // Export edges CSV  
    let edgesCsv = 'source,target,label\n';
    for (const edge of ontology.edges) {
      const label = edge.label.replace(/"/g, '""'); // Escape quotes
      edgesCsv += `"${edge.source}","${edge.target}","${label}"\n`;
    }

    return {
      nodes: nodesCsv,
      edges: edgesCsv
    };
  }

}