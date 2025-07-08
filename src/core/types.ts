export interface TextSpan {
  start: number;
  end: number;
  text: string;
}

export interface EntityClassification {
  type: string;
  confidence: number;
  metadata?: Record<string, any>;
}

export interface Entity {
  id: string;
  text: string;
  spans: TextSpan[];
  classification?: EntityClassification;
  attributes?: Record<string, any>;
}

export interface Relation {
  id: string;
  sourceEntityId: string;
  targetEntityId: string;
  label: string;
  confidence: number;
  metadata?: Record<string, any>;
}

export interface Narrative {
  id: string;
  text: string;
  metadata?: Record<string, any>;
  entities?: Entity[];
  relations?: Relation[];
  createdAt: Date;
  updatedAt: Date;
}

export interface OntologyNode {
  id: string;
  label: string;
  type: string;
  attributes?: Record<string, any>;
}

export interface OntologyEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  attributes?: Record<string, any>;
}

export interface Ontology {
  id: string;
  nodes: OntologyNode[];
  edges: OntologyEdge[];
  metadata?: Record<string, any>;
  createdAt: Date;
}