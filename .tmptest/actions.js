"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runPetAction = runPetAction;
const engine_1 = require("./engine");
function runPetAction(pet, action, nowDate = new Date()) {
    return (0, engine_1.applyPetAction)(pet, action, nowDate);
}
