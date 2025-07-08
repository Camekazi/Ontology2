#!/usr/bin/env node

import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import { NarrativeProcessor } from '../src/pipeline/NarrativeProcessor';
import { MermaidRenderer } from '../src/ui/MermaidRenderer';
import { OntologyExporter } from '../src/export/ExportFormats';

const program = new Command();

program
  .name('dotwork-ontology')
  .description('Transform narratives into structured ontologies')
  .version('0.1.0');

program
  .command('process')
  .description('Process a narrative file and generate ontology')
  .argument('<input>', 'Input narrative file path')
  .option('-o, --output <path>', 'Output directory', './output')
  .option('-f, --format <format>', 'Export format (json-ld, graphml, mermaid, cytoscape, gexf)', 'json-ld')
  .option('--min-confidence <number>', 'Minimum relation confidence', '0.3')
  .option('--max-nodes <number>', 'Maximum nodes in Mermaid diagram', '50')
  .option('--include-legend', 'Include legend in Mermaid output')
  .action(async (input: string, options: any) => {
    try {
      console.log(chalk.blue('🔄 Processing narrative...'));
      
      // Read input file
      const inputPath = path.resolve(input);
      if (!fs.existsSync(inputPath)) {
        console.error(chalk.red(`❌ Input file not found: ${inputPath}`));
        process.exit(1);
      }
      
      const narrativeText = fs.readFileSync(inputPath, 'utf-8');
      
      // Create output directory
      const outputDir = path.resolve(options.output);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      // Process narrative
      const processor = new NarrativeProcessor({
        relationExtractionOptions: {
          minConfidence: parseFloat(options.minConfidence)
        }
      });
      
      const result = await processor.processNarrative(narrativeText);
      
      console.log(chalk.green('✅ Processing complete!'));
      console.log(chalk.gray(`   📊 Found ${result.stats.entityCount} entities and ${result.stats.relationCount} relations`));
      console.log(chalk.gray(`   ⏱️  Processing time: ${result.stats.processingTime}ms`));
      console.log(chalk.gray(`   🎯 Classification coverage: ${(result.stats.classificationCoverage * 100).toFixed(1)}%`));
      
      // Export in requested format(s)
      const formats = options.format.split(',');
      const exporter = new OntologyExporter();
      const renderer = new MermaidRenderer({
        maxNodes: parseInt(options.maxNodes)
      });
      
      for (const format of formats) {
        const baseFileName = path.basename(input, path.extname(input));
        let outputContent: string;
        let fileExtension: string;
        
        switch (format.trim()) {
          case 'json-ld':
            outputContent = JSON.stringify(exporter.toJsonLD(result.ontology), null, 2);
            fileExtension = 'jsonld';
            break;
          case 'graphml':
            outputContent = exporter.toGraphML(result.ontology);
            fileExtension = 'graphml';
            break;
          case 'mermaid':
            outputContent = options.includeLegend ? 
              renderer.renderWithLegend(result.ontology) : 
              renderer.renderOntology(result.ontology);
            fileExtension = 'mmd';
            break;
          case 'cytoscape':
            outputContent = JSON.stringify(exporter.toCytoscape(result.ontology), null, 2);
            fileExtension = 'cytoscape.json';
            break;
          case 'gexf':
            outputContent = exporter.toGEXF(result.ontology);
            fileExtension = 'gexf';
            break;
          default:
            console.warn(chalk.yellow(`⚠️  Unknown format: ${format}`));
            continue;
        }
        
        const outputPath = path.join(outputDir, `${baseFileName}.${fileExtension}`);
        fs.writeFileSync(outputPath, outputContent);
        console.log(chalk.green(`📄 Exported ${format} to: ${outputPath}`));
      }
      
      // Also save the raw processing results
      const resultsPath = path.join(outputDir, `${path.basename(input, path.extname(input))}.results.json`);
      fs.writeFileSync(resultsPath, JSON.stringify({
        narrative: result.narrative.toJSON(),
        ontology: result.ontology.toJSON(),
        stats: result.stats
      }, null, 2));
      console.log(chalk.gray(`📋 Processing results saved to: ${resultsPath}`));
      
    } catch (error) {
      console.error(chalk.red('❌ Error processing narrative:'));
      console.error(error);
      process.exit(1);
    }
  });

program
  .command('batch')
  .description('Process multiple narrative files')
  .argument('<input-dir>', 'Input directory containing narrative files')
  .option('-o, --output <path>', 'Output directory', './output')
  .option('-f, --format <format>', 'Export format (json-ld, graphml, mermaid)', 'json-ld')
  .option('--pattern <pattern>', 'File pattern to match', '*.txt')
  .action(async (inputDir: string, options: any) => {
    try {
      const inputPath = path.resolve(inputDir);
      const outputDir = path.resolve(options.output);
      
      if (!fs.existsSync(inputPath)) {
        console.error(chalk.red(`❌ Input directory not found: ${inputPath}`));
        process.exit(1);
      }
      
      // Find narrative files
      const files = fs.readdirSync(inputPath)
        .filter(file => file.endsWith('.txt'))
        .map(file => path.join(inputPath, file));
      
      if (files.length === 0) {
        console.error(chalk.red('❌ No narrative files found'));
        process.exit(1);
      }
      
      console.log(chalk.blue(`🔄 Processing ${files.length} narrative files...`));
      
      const processor = new NarrativeProcessor();
      const results = [];
      
      for (const file of files) {
        const text = fs.readFileSync(file, 'utf-8');
        const result = await processor.processNarrative(text, path.basename(file, '.txt'));
        results.push(result);
        console.log(chalk.gray(`   ✓ Processed ${path.basename(file)}`));
      }
      
      // Create output directory
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      // Export each result
      const exporter = new OntologyExporter();
      const renderer = new MermaidRenderer();
      
      for (const result of results) {
        const baseFileName = result.narrative.id;
        
        switch (options.format) {
          case 'json-ld':
            const jsonLd = JSON.stringify(exporter.toJsonLD(result.ontology), null, 2);
            fs.writeFileSync(path.join(outputDir, `${baseFileName}.jsonld`), jsonLd);
            break;
          case 'graphml':
            const graphml = exporter.toGraphML(result.ontology);
            fs.writeFileSync(path.join(outputDir, `${baseFileName}.graphml`), graphml);
            break;
          case 'mermaid':
            const mermaid = renderer.renderOntology(result.ontology);
            fs.writeFileSync(path.join(outputDir, `${baseFileName}.mmd`), mermaid);
            break;
        }
      }
      
      // Generate summary statistics
      const stats = processor.getProcessingStats(results);
      const summaryPath = path.join(outputDir, 'batch-summary.json');
      fs.writeFileSync(summaryPath, JSON.stringify(stats, null, 2));
      
      console.log(chalk.green('✅ Batch processing complete!'));
      console.log(chalk.gray(`   📊 Total entities: ${stats.totalEntities}`));
      console.log(chalk.gray(`   🔗 Total relations: ${stats.totalRelations}`));
      console.log(chalk.gray(`   ⏱️  Average processing time: ${stats.averageProcessingTime.toFixed(1)}ms`));
      console.log(chalk.gray(`   📋 Summary saved to: ${summaryPath}`));
      
    } catch (error) {
      console.error(chalk.red('❌ Error in batch processing:'));
      console.error(error);
      process.exit(1);
    }
  });

program
  .command('demo')
  .description('Run with example narrative')
  .option('-o, --output <path>', 'Output directory', './demo-output')
  .action(async (options: any) => {
    const exampleNarrative = `Last quarter, we focused heavily on improving the onboarding experience, especially with the rollout of the new AI-powered insights feature. The engineering team worked closely with the design team to implement a streamlined workflow that reduced user friction by 40%. Our customer success metrics showed significant improvement, with user activation rates increasing from 65% to 85% within the first week of launch. The initiative was led by Sarah Johnson and supported by the product team, who conducted extensive user research throughout Q3. Moving forward into Q4, we aim to expand these insights capabilities and target enterprise customers, building on the foundation we've established.`;
    
    console.log(chalk.blue('🚀 Running demo with example narrative...'));
    console.log(chalk.gray('Narrative preview:'));
    console.log(chalk.gray(exampleNarrative.substring(0, 100) + '...'));
    
    try {
      const processor = new NarrativeProcessor();
      const result = await processor.processNarrative(exampleNarrative, 'demo-narrative');
      
      const outputDir = path.resolve(options.output);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      // Export in multiple formats
      const exporter = new OntologyExporter();
      const renderer = new MermaidRenderer();
      
      const exports = [
        { format: 'json-ld', content: JSON.stringify(exporter.toJsonLD(result.ontology), null, 2), ext: 'jsonld' },
        { format: 'mermaid', content: renderer.renderWithLegend(result.ontology), ext: 'mmd' },
        { format: 'results', content: JSON.stringify(result, null, 2), ext: 'results.json' }
      ];
      
      for (const exp of exports) {
        const filePath = path.join(outputDir, `demo.${exp.ext}`);
        fs.writeFileSync(filePath, exp.content);
        console.log(chalk.green(`📄 Exported ${exp.format} to: ${filePath}`));
      }
      
      console.log(chalk.green('✅ Demo complete!'));
      console.log(chalk.gray(`   📊 Found ${result.stats.entityCount} entities and ${result.stats.relationCount} relations`));
      
    } catch (error) {
      console.error(chalk.red('❌ Demo failed:'));
      console.error(error);
      process.exit(1);
    }
  });

program.parse();