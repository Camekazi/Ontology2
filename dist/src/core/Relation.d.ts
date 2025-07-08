import { Relation as IRelation } from './types';
export declare class Relation implements IRelation {
    id: string;
    sourceEntityId: string;
    targetEntityId: string;
    label: string;
    confidence: number;
    metadata?: Record<string, any>;
    constructor(sourceEntityId: string, targetEntityId: string, label: string, confidence?: number, id?: string, metadata?: Record<string, any>);
    private generateId;
    setConfidence(confidence: number): void;
    getMetadata(key: string): any;
    setMetadata(key: string, value: any): void;
    isHighConfidence(threshold?: number): boolean;
    toJSON(): IRelation;
}
//# sourceMappingURL=Relation.d.ts.map