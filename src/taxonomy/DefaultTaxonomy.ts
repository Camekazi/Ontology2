import { Taxonomy, TaxonomyClass } from './types';

export const DEFAULT_TAXONOMY_CLASSES: TaxonomyClass[] = [
  {
    id: 'time-period',
    name: 'Time Period',
    description: 'Temporal boundaries and timeframes (quarters, years, deadlines)',
    color: '#FFC0CB', // Pink
    keywords: ['quarter', 'year', 'month', 'week', 'deadline', 'timeline', 'period', 'fiscal', 'H1', 'H2', 'Q1', 'Q2', 'Q3', 'Q4', 'last quarter'],
    patterns: ['\\d{4}', 'Q[1-4]', 'H[12]', 'last \\w+', 'next \\w+', 'this \\w+', '\\w+ quarter']
  },
  {
    id: 'cycle-theme',
    name: 'Cycle Theme',
    description: 'Recurring themes and seasonal focuses across time periods',
    color: '#000000', // Black
    keywords: ['growth', 'expansion', 'focus', 'theme', 'cycle', 'seasonal', 'efforts', 'push'],
    patterns: ['\\w+ efforts', '\\w+ focus', '\\w+ theme', '\\w+ cycle']
  },
  {
    id: 'initiative',
    name: 'Initiative',
    description: 'Strategic programs, projects, and organized efforts',
    color: '#ADD8E6', // Light-blue
    keywords: ['improving', 'initiative', 'effort', 'campaign', 'program', 'project', 'improving the \\w+'],
    patterns: ['improving \\w+', 'initiative to \\w+', 'effort to \\w+', 'program for \\w+']
  },
  {
    id: 'product-capability',
    name: 'Product Capability',
    description: 'Features, tools, and functional capabilities of the product',
    color: '#6A5ACD', // Slate-blue
    keywords: ['AI-powered', 'insights', 'feature', 'capability', 'functionality', 'tool', 'platform'],
    patterns: ['AI-powered \\w+', '\\w+ feature', '\\w+ capability', '\\w+ functionality']
  },
  {
    id: 'release-launch',
    name: 'Release Launch',
    description: 'Product releases, deployments, and launch activities',
    color: '#E6E6FA', // Lavender
    keywords: ['rollout', 'launch', 'release', 'deployment', 'go-live', 'ship'],
    patterns: ['rollout of \\w+', 'launch of \\w+', 'release of \\w+', 'deployment of \\w+']
  },
  {
    id: 'customer-segment',
    name: 'Customer Segment',
    description: 'Target audiences, customer groups, and market segments',
    color: '#FFFF00', // Yellow
    keywords: ['customers', 'users', 'segment', 'market', 'audience', 'B2B', 'SaaS', 'enterprise', 'mid-sized'],
    patterns: ['customers in \\w+', '\\w+ customers', '\\w+ users', '\\w+ segment']
  },
  {
    id: 'insight',
    name: 'Insight',
    description: 'Key learnings, discoveries, and understanding gained',
    color: '#98FB98', // Pale-green
    keywords: ['see value', 'insight', 'learning', 'discovery', 'understanding', 'realize', 'quickly'],
    patterns: ['see \\w+ quickly', 'insight into \\w+', 'learned that \\w+', 'discovered \\w+']
  },
  {
    id: 'goal',
    name: 'Goal',
    description: 'Objectives, targets, and desired outcomes to achieve',
    color: '#00FF00', // Green
    keywords: ['reduce', 'goal', 'objective', 'target', 'aim', 'resolve tickets', 'time to'],
    patterns: ['reduce \\w+', 'goal to \\w+', 'objective to \\w+', 'aim to \\w+', 'reduce the time']
  },
  {
    id: 'target',
    name: 'Target',
    description: 'Specific measurable targets and metrics to hit',
    color: '#FF7F50', // Coral
    keywords: ['reduction', 'churn', 'target', 'metric', 'KPI', 'achieve', 'hit'],
    patterns: ['reduction in \\w+', 'target of \\w+', 'achieve \\w+', 'hit \\w+']
  },
  {
    id: 'principle',
    name: 'Principle',
    description: 'Guiding values, beliefs, and methodological approaches',
    color: '#FFFFE0', // Light-yellow
    keywords: ['iterate', 'validate', 'principle', 'approach', 'methodology', 'belief', 'value'],
    patterns: ['iterate and \\w+', 'validate \\w+', 'principle of \\w+', 'approach to \\w+']
  }
];

export class DefaultTaxonomy implements Taxonomy {
  public readonly id = 'dotwork-default';
  public readonly name = 'Dotwork Default Taxonomy';
  public readonly version = '1.0.0';
  public readonly description = 'Default 10-class taxonomy for narrative-to-ontology transformation';
  public readonly classes = DEFAULT_TAXONOMY_CLASSES;

  public getClass(id: string): TaxonomyClass | undefined {
    return this.classes.find(c => c.id === id);
  }

  public getClassByName(name: string): TaxonomyClass | undefined {
    return this.classes.find(c => c.name.toLowerCase() === name.toLowerCase());
  }

  public findMatchingClasses(text: string): TaxonomyClass[] {
    const matches: TaxonomyClass[] = [];
    const lowerText = text.toLowerCase();

    for (const taxonomyClass of this.classes) {
      // Check keywords
      const keywordMatch = taxonomyClass.keywords.some(keyword => 
        lowerText.includes(keyword.toLowerCase())
      );

      // Check patterns
      const patternMatch = taxonomyClass.patterns.some(pattern => {
        const regex = new RegExp(pattern, 'i');
        return regex.test(text);
      });

      if (keywordMatch || patternMatch) {
        matches.push(taxonomyClass);
      }
    }

    return matches;
  }

  public classifyText(text: string): { class: TaxonomyClass; confidence: number } | null {
    const matches = this.findMatchingClasses(text);
    
    if (matches.length === 0) {
      return null;
    }

    // For now, return the first match with a confidence based on match strength
    const bestMatch = matches[0];
    const confidence = this.calculateConfidence(text, bestMatch);
    
    return {
      class: bestMatch,
      confidence
    };
  }

  private calculateConfidence(text: string, taxonomyClass: TaxonomyClass): number {
    const lowerText = text.toLowerCase();
    let score = 0;
    let maxScore = 0;

    // Score based on keyword matches
    for (const keyword of taxonomyClass.keywords) {
      maxScore += 1;
      if (lowerText.includes(keyword.toLowerCase())) {
        score += 1;
      }
    }

    // Score based on pattern matches
    for (const pattern of taxonomyClass.patterns) {
      maxScore += 1;
      const regex = new RegExp(pattern, 'i');
      if (regex.test(text)) {
        score += 1;
      }
    }

    return maxScore > 0 ? score / maxScore : 0;
  }

  public toJSON(): Taxonomy {
    return {
      id: this.id,
      name: this.name,
      version: this.version,
      description: this.description,
      classes: this.classes
    };
  }
}