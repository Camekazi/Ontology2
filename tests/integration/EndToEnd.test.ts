import * as fs from 'fs';
import * as path from 'path';
import { NarrativeProcessor } from '../../src/pipeline/NarrativeProcessor';
import { MermaidRenderer } from '../../src/ui/MermaidRenderer';
import { OntologyExporter } from '../../src/export/ExportFormats';

describe('End-to-End Integration', () => {
  let processor: NarrativeProcessor;
  let renderer: MermaidRenderer;
  let exporter: OntologyExporter;

  beforeEach(() => {
    processor = new NarrativeProcessor();
    renderer = new MermaidRenderer();
    exporter = new OntologyExporter();
  });

  describe('complete pipeline', () => {
    it('should process example narrative end-to-end', async () => {
      const examplePath = path.join(__dirname, '../../examples/narratives/example-01.txt');
      
      // Skip if example file doesn't exist (in case tests run before examples are created)
      if (!fs.existsSync(examplePath)) {
        console.warn('Example file not found, skipping integration test');
        return;
      }

      const narrativeText = fs.readFileSync(examplePath, 'utf-8');
      
      // Step 1: Process narrative
      const result = await processor.processNarrative(narrativeText, 'example-01');
      
      expect(result.narrative.text).toBe(narrativeText);
      expect(result.narrative.id).toBe('example-01');
      expect(result.stats.entityCount).toBeGreaterThan(0);
      
      // Step 2: Generate Mermaid diagram
      const mermaidDiagram = renderer.renderOntology(result.ontology);
      expect(mermaidDiagram).toContain('flowchart');
      expect(mermaidDiagram.split('\n').length).toBeGreaterThan(5);
      
      // Step 3: Export to JSON-LD
      const jsonLd = exporter.toJsonLD(result.ontology);
      expect(jsonLd['@context']).toBeDefined();
      expect(jsonLd['@graph']).toBeInstanceOf(Array);
      expect(jsonLd['@graph'].length).toBe(result.ontology.nodes.length);
      
      // Step 4: Export to GraphML
      const graphML = exporter.toGraphML(result.ontology);
      expect(graphML).toContain('<?xml version="1.0"');
      expect(graphML).toContain('<graphml');
      expect(graphML).toContain('</graphml>');
      
      // Verify data consistency
      expect(result.ontology.nodes.length).toBe(result.narrative.entities.length);
      expect(result.ontology.edges.length).toBe(result.narrative.relations.length);
    });

    it('should handle workflow with multiple formats', async () => {
      const text = 'The product team achieved their Q1 goals by improving user satisfaction metrics.';
      
      const result = await processor.processNarrative(text);
      
      // Generate multiple export formats
      const formats = {
        jsonLd: exporter.toJsonLD(result.ontology),
        graphML: exporter.toGraphML(result.ontology),
        cytoscape: exporter.toCytoscape(result.ontology),
        gexf: exporter.toGEXF(result.ontology),
        mermaid: renderer.renderOntology(result.ontology),
        mermaidWithLegend: renderer.renderWithLegend(result.ontology)
      };
      
      // Verify all formats are generated
      expect(formats.jsonLd['@graph']).toBeInstanceOf(Array);
      expect(formats.graphML).toContain('<graphml');
      expect((formats.cytoscape as any).elements).toBeInstanceOf(Array);
      expect(formats.gexf).toContain('<gexf');
      expect(formats.mermaid).toContain('flowchart');
      expect(formats.mermaidWithLegend).toContain('Legend');
    });

    it('should maintain data integrity across transformations', async () => {
      const text = 'Sarah Johnson led the engineering team to improve customer metrics in Q2 2024.';
      
      const result = await processor.processNarrative(text);
      
      // Original data
      const originalEntities = result.narrative.entities;
      const originalRelations = result.narrative.relations;
      
      // Ontology transformation
      const ontologyNodes = result.ontology.nodes;
      const ontologyEdges = result.ontology.edges;
      
      // Verify entity-to-node mapping
      expect(ontologyNodes.length).toBe(originalEntities.length);
      for (const entity of originalEntities) {
        const node = ontologyNodes.find(n => n.id === entity.id);
        expect(node).toBeDefined();
        expect(node!.label).toBe(entity.text);
      }
      
      // Verify relation-to-edge mapping
      expect(ontologyEdges.length).toBe(originalRelations.length);
      for (const relation of originalRelations) {
        const edge = ontologyEdges.find(e => e.id === relation.id);
        expect(edge).toBeDefined();
        expect(edge!.source).toBe(relation.sourceEntityId);
        expect(edge!.target).toBe(relation.targetEntityId);
        expect(edge!.label).toBe(relation.label);
      }
    });

    it('should produce consistent results for same input', async () => {
      const text = 'The team completed the project successfully.';
      
      const result1 = await processor.processNarrative(text, 'test-1');
      const result2 = await processor.processNarrative(text, 'test-2');
      
      // Results should be structurally similar (same entity/relation patterns)
      expect(result1.stats.entityCount).toBe(result2.stats.entityCount);
      expect(result1.stats.relationCount).toBe(result2.stats.relationCount);
      
      // Entity types should be consistent
      const types1 = result1.narrative.entities.map(e => e.classification?.type).sort();
      const types2 = result2.narrative.entities.map(e => e.classification?.type).sort();
      expect(types1).toEqual(types2);
    });

    it('should handle complex narrative with multiple entities and relations', async () => {
      const complexText = `
        In Q1 2024, the engineering team led by Sarah Johnson successfully launched 
        the new AI-powered analytics platform. Customer satisfaction scores improved 
        by 35%, and user engagement metrics showed a 50% increase. The product team 
        collaborated with the design team to ensure seamless user experience. 
        Revenue grew by $2.5 million, exceeding our quarterly targets. Moving into Q2, 
        we plan to expand these capabilities and focus on enterprise customer acquisition.
      `;
      
      const result = await processor.processNarrative(complexText);
      
      // Should extract multiple entities and relations
      expect(result.stats.entityCount).toBeGreaterThan(10);
      expect(result.stats.relationCount).toBeGreaterThan(0);
      
      // Should classify entities across multiple types
      const classifiedEntities = result.narrative.entities.filter(e => e.classification);
      const uniqueTypes = new Set(classifiedEntities.map(e => e.classification!.type));
      expect(uniqueTypes.size).toBeGreaterThanOrEqual(3);
      
      // Should generate meaningful visualizations
      const mermaid = renderer.renderOntology(result.ontology);
      expect(mermaid.split('\n').length).toBeGreaterThan(15);
      
      // Should export to valid formats
      const jsonLd = exporter.toJsonLD(result.ontology);
      expect(jsonLd['@graph'].length).toBeGreaterThan(10);
    });
  });

  describe('performance and scalability', () => {
    it('should process medium-length narrative efficiently', async () => {
      const mediumText = 'The team worked on multiple projects. '.repeat(50);
      
      const startTime = Date.now();
      const result = await processor.processNarrative(mediumText);
      const endTime = Date.now();
      
      const processingTime = endTime - startTime;
      expect(processingTime).toBeLessThan(5000); // Should complete within 5 seconds
      expect(result.stats.processingTime).toBeGreaterThan(0);
    });

    it('should handle batch processing', async () => {
      const narratives = [
        'Team A achieved their quarterly goals.',
        'Team B improved customer satisfaction.',
        'Team C launched new product features.'
      ];
      
      const results = await processor.processMultipleNarratives(narratives);
      expect(results).toHaveLength(3);
      
      // All should be processed successfully
      results.forEach(result => {
        expect(result.stats.entityCount).toBeGreaterThan(0);
        expect(result.stats.processingTime).toBeGreaterThan(0);
      });
    });
  });
});