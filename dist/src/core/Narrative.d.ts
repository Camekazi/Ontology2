import { Narrative as INarrative, Entity, Relation } from './types';
export declare class Narrative implements INarrative {
    id: string;
    text: string;
    metadata?: Record<string, any>;
    entities: Entity[];
    relations: Relation[];
    createdAt: Date;
    updatedAt: Date;
    constructor(text: string, id?: string, metadata?: Record<string, any>);
    private generateId;
    addEntity(entity: Entity): void;
    addRelation(relation: Relation): void;
    getEntity(id: string): Entity | undefined;
    getRelation(id: string): Relation | undefined;
    getEntitiesByType(type: string): Entity[];
    getRelationsByLabel(label: string): Relation[];
    toJSON(): INarrative;
}
//# sourceMappingURL=Narrative.d.ts.map