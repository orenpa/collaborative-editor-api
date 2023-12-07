"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
// GET all code blocks (adjust based on your actual data fetching logic)
router.get("/", (req, res) => {
    res.json({ message: "List of code blocks" });
});
// GET a specific code block by ID
router.get("/:id", (req, res) => {
    const { id } = req.params;
    res.json({ message: `Details of code block ${id}` });
});
exports.default = router;
