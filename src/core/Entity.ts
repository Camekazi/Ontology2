import { Entity as IEntity, TextSpan, EntityClassification } from './types';

export class Entity implements IEntity {
  public id: string;
  public text: string;
  public spans: TextSpan[];
  public classification?: EntityClassification;
  public attributes?: Record<string, any>;

  constructor(
    text: string,
    spans: TextSpan[],
    id?: string,
    classification?: EntityClassification,
    attributes?: Record<string, any>
  ) {
    this.id = id || this.generateId();
    this.text = text;
    this.spans = spans;
    this.classification = classification;
    this.attributes = attributes;
  }

  private generateId(): string {
    return `entity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  public setClassification(classification: EntityClassification): void {
    this.classification = classification;
  }

  public getAttribute(key: string): any {
    return this.attributes?.[key];
  }

  public setAttribute(key: string, value: any): void {
    if (!this.attributes) {
      this.attributes = {};
    }
    this.attributes[key] = value;
  }

  public getFirstSpan(): TextSpan | undefined {
    return this.spans[0];
  }

  public getTotalLength(): number {
    return this.spans.reduce((total, span) => total + (span.end - span.start), 0);
  }

  public toJSON(): IEntity {
    return {
      id: this.id,
      text: this.text,
      spans: this.spans,
      classification: this.classification,
      attributes: this.attributes
    };
  }
}