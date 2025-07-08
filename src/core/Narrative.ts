import { Narrative as INarrative, Entity, Relation } from './types';

export class Narrative implements INarrative {
  public id: string;
  public text: string;
  public metadata?: Record<string, any>;
  public entities: Entity[] = [];
  public relations: Relation[] = [];
  public createdAt: Date;
  public updatedAt: Date;

  constructor(text: string, id?: string, metadata?: Record<string, any>) {
    this.id = id || this.generateId();
    this.text = text;
    this.metadata = metadata;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  private generateId(): string {
    return `narrative-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  public addEntity(entity: Entity): void {
    this.entities.push(entity);
    this.updatedAt = new Date();
  }

  public addRelation(relation: Relation): void {
    this.relations.push(relation);
    this.updatedAt = new Date();
  }

  public getEntity(id: string): Entity | undefined {
    return this.entities.find(e => e.id === id);
  }

  public getRelation(id: string): Relation | undefined {
    return this.relations.find(r => r.id === id);
  }

  public getEntitiesByType(type: string): Entity[] {
    return this.entities.filter(e => e.classification?.type === type);
  }

  public getRelationsByLabel(label: string): Relation[] {
    return this.relations.filter(r => r.label === label);
  }

  public toJSON(): INarrative {
    return {
      id: this.id,
      text: this.text,
      metadata: this.metadata,
      entities: this.entities,
      relations: this.relations,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}