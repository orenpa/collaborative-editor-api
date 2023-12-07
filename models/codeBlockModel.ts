import mongoose from "mongoose";

// Define the schema
const CodeBlockSchema = new mongoose.Schema({
  id: String,
  title: String,
  code: String,
});

// Create the model of mongoode that represents a data model for storing codeblocks in a MongoDB
const CodeBlock = mongoose.model("CodeBlock", CodeBlockSchema);

export default CodeBlock;
