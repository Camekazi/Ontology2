import { Entity as IEntity, TextSpan, EntityClassification } from './types';
export declare class Entity implements IEntity {
    id: string;
    text: string;
    spans: TextSpan[];
    classification?: EntityClassification;
    attributes?: Record<string, any>;
    constructor(text: string, spans: TextSpan[], id?: string, classification?: EntityClassification, attributes?: Record<string, any>);
    private generateId;
    setClassification(classification: EntityClassification): void;
    getAttribute(key: string): any;
    setAttribute(key: string, value: any): void;
    getFirstSpan(): TextSpan | undefined;
    getTotalLength(): number;
    toJSON(): IEntity;
}
//# sourceMappingURL=Entity.d.ts.map