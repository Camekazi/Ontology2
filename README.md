# Dotwork Narrative-to-Ontology Workspace

Transform informal narratives into structured, color-coded ontologies and shareable concept maps. This workspace prevents strategy-execution drift by making relationships between narratives, entities, classifications, and ontologies explicit and queryable.

> *"Plans lose their power the moment strategy and execution drift apart."* — John Cutler

## Features

- 🔍 **Entity Extraction**: Extract entities from narratives using NLP (noun-chunks + custom patterns)
- 🔗 **Relationship Inference**: Infer relationships using linguistic cues and patterns
- 🏷️ **Classification**: Classify entities using a 10-class taxonomy (TimePeriod, Initiative, Outcome, etc.)
- 🕸️ **Interactive Visualization**: Generate interactive D3.js network graphs with drag-and-drop, filtering, and real-time exploration
- 📊 **Multiple Formats**: Export to JSON-LD, GraphML, GEXF, Cytoscape, and Mermaid formats
- ⚡ **CLI Tools**: End-to-end workflow processing in < 15 minutes

## Quick Start

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run with example narrative
npm run example

# Process your own narrative and generate interactive visualization
npm run cli process path/to/narrative.txt --output results --format cytoscape

# Run demo
npm run cli demo
```

## Implementation Flow

```text
1. Capture Narrative   – paste, upload or voice-to-text
2. Find the Things     – entity extraction (noun-chunks + custom tags)
3. Understand Relations – edge suggestion with linguistic cues
4. Classify the Things – default taxonomy (Time-Period, Initiative … Principle)
5. Generate Ontology   – graph + JSON-LD / GraphML export
```

## Usage

### CLI Commands

```bash
# Process single narrative with interactive visualization
npx dotwork-ontology process narrative.txt -o output/ -f cytoscape,json-ld

# Process multiple narratives for network analysis
npx dotwork-ontology batch narratives/ -o output/ -f gexf,graphml

# Run demo with interactive D3.js network
npx dotwork-ontology demo -o demo-output/
```

### Programmatic API

```typescript
import { NarrativeProcessor, MermaidRenderer, OntologyExporter } from 'dotwork-narrative-ontology';

const processor = new NarrativeProcessor();
const result = await processor.processNarrative(narrativeText);

// Generate interactive visualizations
const exporter = new OntologyExporter();
const cytoscape = exporter.toCytoscape(result.ontology); // For interactive D3.js networks
const jsonLd = exporter.toJsonLD(result.ontology);
const graphML = exporter.toGraphML(result.ontology);
```

## Default Taxonomy

The system uses a 10-class taxonomy for entity classification:

| Class | Description | Color |
|-------|-------------|-------|
| **TimePeriod** | Temporal boundaries (quarters, years, deadlines) | 🔴 |
| **Initiative** | Strategic programs and organized efforts | 🔵 |
| **Outcome** | Results, achievements, measurable impacts | 🟢 |
| **Stakeholder** | People, teams, organizations involved | 🟡 |
| **Process** | Workflows, procedures, systematic approaches | 🟠 |
| **Resource** | Assets, tools, budget, capabilities | 🟣 |
| **Goal** | Objectives, targets, desired states | 🩷 |
| **Metric** | KPIs and measurements | 🟨 |
| **Insight** | Learnings, discoveries, key findings | 🔷 |
| **Principle** | Guiding values, beliefs, strategic directions | ⚪ |

## Project Structure

```
src/
├── core/           # Domain objects (Narrative, Entity, Relation, Ontology)
├── taxonomy/       # Default 10-class taxonomy
├── extraction/     # Entity and relation extraction
├── pipeline/       # End-to-end processing pipeline
├── ui/            # Visualization renderers (Mermaid, D3.js helpers)
└── export/        # Export to various formats (Cytoscape, JSON-LD, GraphML)

tools/             # CLI tools
examples/          # Sample narratives and outputs
tests/             # Comprehensive test suite
docs/              # Documentation and ADRs
```

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run tests with coverage
npm run test

# Lint code
npm run lint

# Type check
npm run typecheck

# Build project
npm run build

# Watch mode for development
npm run dev
```

## Testing

The project includes comprehensive tests covering:

- Unit tests for core components
- Integration tests for the full pipeline
- End-to-end tests with example narratives
- Performance and scalability tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- --testPathPattern=EntityExtractor

# Run tests with coverage
npm run test -- --coverage
```

## Examples

See the `examples/` directory for sample narratives and their expected ontology outputs:

- **example-01.txt**: Product development narrative with onboarding improvements
- **example-02.txt**: Business performance narrative with financial metrics
- **example-03.txt**: Mobile app redesign project narrative

## Visualization & Export Formats

### Interactive D3.js Network (Recommended)
- **Drag-and-drop** node manipulation
- **Real-time filtering** by entity type
- **Hover interactions** with detailed tooltips
- **Search functionality** to find specific entities
- **Physics-based layouts** for natural clustering
- **Color-coded nodes** by taxonomy classification

### Cytoscape.js Format
```json
{
  "elements": [
    {
      "data": {
        "id": "engineering_team",
        "label": "engineering team",
        "type": "stakeholder"
      }
    }
  ],
  "style": [...],
  "layout": { "name": "cose" }
}
```

### JSON-LD for Semantic Web
```json
{
  "@context": {
    "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
    "dotwork": "https://dotwork.com/ontology#"
  },
  "@graph": [
    {
      "@id": "dotwork:engineering_team",
      "@type": "dotwork:stakeholder",
      "rdfs:label": "engineering team"
    }
  ]
}
```

### Professional Network Analysis
- **GraphML** for yEd, Gephi, NetworkX
- **GEXF** for advanced network analysis
- **Mermaid** for documentation and simple diagrams

## Contributing

1. Follow the coding conventions established in the codebase
2. Write tests for new functionality
3. Update documentation as needed
4. Ensure all tests pass and linting is clean

## License

MIT License - see LICENSE file for details.

## Strategic Workflow

```text
Strategic Intent → Investment Agreement → Customer Outcomes → Measurement
          ▲                                        |
          └─────────────── Feedback ───────────────┘
```

Each library change should answer: *"Which step does this accelerate or improve?"*