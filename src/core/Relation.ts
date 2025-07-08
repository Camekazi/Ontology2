import { Relation as IRelation } from './types';

export class Relation implements IRelation {
  public id: string;
  public sourceEntityId: string;
  public targetEntityId: string;
  public label: string;
  public confidence: number;
  public metadata?: Record<string, any>;

  constructor(
    sourceEntityId: string,
    targetEntityId: string,
    label: string,
    confidence: number = 1.0,
    id?: string,
    metadata?: Record<string, any>
  ) {
    this.id = id || this.generateId();
    this.sourceEntityId = sourceEntityId;
    this.targetEntityId = targetEntityId;
    this.label = label;
    this.confidence = Math.max(0, Math.min(1, confidence));
    this.metadata = metadata;
  }

  private generateId(): string {
    return `relation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  public setConfidence(confidence: number): void {
    this.confidence = Math.max(0, Math.min(1, confidence));
  }

  public getMetadata(key: string): any {
    return this.metadata?.[key];
  }

  public setMetadata(key: string, value: any): void {
    if (!this.metadata) {
      this.metadata = {};
    }
    this.metadata[key] = value;
  }

  public isHighConfidence(threshold: number = 0.8): boolean {
    return this.confidence >= threshold;
  }

  public toJSON(): IRelation {
    return {
      id: this.id,
      sourceEntityId: this.sourceEntityId,
      targetEntityId: this.targetEntityId,
      label: this.label,
      confidence: this.confidence,
      metadata: this.metadata
    };
  }
}