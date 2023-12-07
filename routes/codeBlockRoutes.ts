import { Router } from "express";
import CodeBlock from "../models/codeBlockModel";

const router = Router();

// GET all code blocks
router.get("/", async (req, res) => {
  try {
    const codeBlocks = await CodeBlock.find({});
    res.json(codeBlocks);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET a specific code block by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const codeBlock = await CodeBlock.findById(id);
    if (codeBlock) {
      res.json(codeBlock);
    } else {
      res.status(404).json({ error: "Code block not found" });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
