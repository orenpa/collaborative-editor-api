import mongoose from "mongoose";

// Define the schema
const CodeBlockSchema = new mongoose.Schema({
  id: String,
  title: String,
  code: String,
});

// Create the model
const CodeBlock = mongoose.model("CodeBlock", CodeBlockSchema);

export default CodeBlock;
