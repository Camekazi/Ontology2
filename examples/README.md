# Examples

This directory contains example narratives and their expected ontology outputs for testing and demonstration purposes.

## Structure

- `narratives/` - Sample narrative text files
- `ontologies/` - Expected ontology outputs in various formats

## Example Narratives

### example-01.txt
A product development narrative focusing on onboarding improvements and AI features. Demonstrates:
- Stakeholder relationships (engineering team, design team, Sarah Johnson)
- Process improvements (onboarding experience, streamlined workflow)
- Metrics and outcomes (40% friction reduction, 65% to 85% activation rate improvement)
- Temporal context (Q3, Q4)

### example-02.txt
A business performance narrative covering financial metrics and growth. Demonstrates:
- Financial outcomes (revenue growth, deal closures)
- Team performance (sales team, marketing campaigns)
- Customer metrics (retention rates, customer success)
- Future planning (hiring goals, investment priorities)

### example-03.txt
A mobile app redesign project narrative. Demonstrates:
- Project outcomes (user growth, satisfaction improvements)
- Technical implementations (React Native architecture)
- Cross-functional collaboration (design, engineering, QA teams)
- Performance metrics (app store ratings, crash rates)

## Expected Outputs

The `ontologies/` folder contains expected JSON-LD outputs that can be used as golden references for testing the extraction pipeline accuracy.

## Usage

Use these examples with the CLI tool:

```bash
# Process single example
npm run cli process examples/narratives/example-01.txt

# Process all examples
npm run cli batch examples/narratives/

# Run with demo narrative
npm run cli demo
```