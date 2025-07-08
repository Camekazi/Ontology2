import { Taxonomy, TaxonomyClass } from './types';

export const DEFAULT_TAXONOMY_CLASSES: TaxonomyClass[] = [
  {
    id: 'time-period',
    name: 'TimePeriod',
    description: 'Temporal boundaries and timeframes (quarters, years, deadlines)',
    color: '#FF6B6B',
    keywords: ['quarter', 'year', 'month', 'week', 'deadline', 'timeline', 'period', 'fiscal', 'H1', 'H2', 'Q1', 'Q2', 'Q3', 'Q4'],
    patterns: ['\\d{4}', 'Q[1-4]', 'H[12]', 'last \\w+', 'next \\w+', 'this \\w+', '\\w+ quarter']
  },
  {
    id: 'initiative',
    name: 'Initiative',
    description: 'Strategic programs, projects, and organized efforts',
    color: '#4ECDC4',
    keywords: ['project', 'program', 'initiative', 'effort', 'campaign', 'rollout', 'launch', 'implementation'],
    patterns: ['\\w+ project', '\\w+ program', '\\w+ initiative', 'rollout of \\w+', 'launch of \\w+']
  },
  {
    id: 'outcome',
    name: 'Outcome',
    description: 'Results, achievements, and measurable impacts',
    color: '#45B7D1',
    keywords: ['result', 'outcome', 'achievement', 'impact', 'success', 'improvement', 'increase', 'decrease', 'growth'],
    patterns: ['\\d+% \\w+', 'improved \\w+', 'increased \\w+', 'reduced \\w+', 'achieved \\w+']
  },
  {
    id: 'stakeholder',
    name: 'Stakeholder',
    description: 'People, teams, and organizations involved',
    color: '#96CEB4',
    keywords: ['team', 'user', 'customer', 'client', 'stakeholder', 'manager', 'engineer', 'designer', 'analyst'],
    patterns: ['\\w+ team', '\\w+ users', '\\w+ customers', '\\w+ stakeholders']
  },
  {
    id: 'process',
    name: 'Process',
    description: 'Workflows, procedures, and systematic approaches',
    color: '#FFEAA7',
    keywords: ['process', 'workflow', 'procedure', 'methodology', 'approach', 'system', 'framework'],
    patterns: ['\\w+ process', '\\w+ workflow', '\\w+ procedure', '\\w+ methodology']
  },
  {
    id: 'resource',
    name: 'Resource',
    description: 'Assets, tools, budget, and capabilities',
    color: '#DDA0DD',
    keywords: ['budget', 'tool', 'technology', 'platform', 'resource', 'asset', 'capability', 'infrastructure'],
    patterns: ['\\$\\d+', '\\w+ tool', '\\w+ platform', '\\w+ technology']
  },
  {
    id: 'goal',
    name: 'Goal',
    description: 'Objectives, targets, and desired states',
    color: '#FFB6C1',
    keywords: ['goal', 'objective', 'target', 'aim', 'vision', 'mission', 'purpose', 'intent'],
    patterns: ['goal of \\w+', 'objective to \\w+', 'target of \\w+', 'aim to \\w+']
  },
  {
    id: 'metric',
    name: 'Metric',
    description: 'Key performance indicators and measurements',
    color: '#F0E68C',
    keywords: ['metric', 'KPI', 'measurement', 'indicator', 'score', 'rate', 'ratio', 'percentage'],
    patterns: ['\\w+ rate', '\\w+ score', '\\w+ metric', '\\w+ KPI', '\\d+%']
  },
  {
    id: 'insight',
    name: 'Insight',
    description: 'Learnings, discoveries, and key findings',
    color: '#87CEEB',
    keywords: ['insight', 'learning', 'discovery', 'finding', 'observation', 'trend', 'pattern', 'analysis'],
    patterns: ['learned that \\w+', 'discovered \\w+', 'found that \\w+', 'insight into \\w+']
  },
  {
    id: 'principle',
    name: 'Principle',
    description: 'Guiding values, beliefs, and strategic directions',
    color: '#D3D3D3',
    keywords: ['principle', 'value', 'belief', 'strategy', 'direction', 'philosophy', 'approach', 'mindset'],
    patterns: ['principle of \\w+', 'value of \\w+', 'belief in \\w+', 'strategy of \\w+']
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