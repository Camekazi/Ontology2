"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ontology = exports.Relation = exports.Entity = exports.Narrative = void 0;
__exportStar(require("./types"), exports);
var Narrative_1 = require("./Narrative");
Object.defineProperty(exports, "Narrative", { enumerable: true, get: function () { return Narrative_1.Narrative; } });
var Entity_1 = require("./Entity");
Object.defineProperty(exports, "Entity", { enumerable: true, get: function () { return Entity_1.Entity; } });
var Relation_1 = require("./Relation");
Object.defineProperty(exports, "Relation", { enumerable: true, get: function () { return Relation_1.Relation; } });
var Ontology_1 = require("./Ontology");
Object.defineProperty(exports, "Ontology", { enumerable: true, get: function () { return Ontology_1.Ontology; } });
//# sourceMappingURL=index.js.map