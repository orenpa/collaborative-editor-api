"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const codeBlockModel_1 = __importDefault(require("../models/codeBlockModel"));
const router = (0, express_1.Router)();
// GET all code blocks
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const codeBlocks = yield codeBlockModel_1.default.find({});
        res.json(codeBlocks);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
// GET a specific code block by ID
router.get("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const codeBlock = yield codeBlockModel_1.default.findById(id);
        if (codeBlock) {
            res.json(codeBlock);
        }
        else {
            res.status(404).json({ error: "Code block not found" });
        }
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
exports.default = router;
