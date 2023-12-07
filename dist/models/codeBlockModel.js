"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
// Define the schema
const CodeBlockSchema = new mongoose_1.default.Schema({
    id: String,
    title: String,
    code: String,
});
// Create the model
const CodeBlock = mongoose_1.default.model("CodeBlock", CodeBlockSchema);
exports.default = CodeBlock;
