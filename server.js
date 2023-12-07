"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const lobbyRoutes_1 = __importDefault(require("./routes/lobbyRoutes")); // Named as lobbyRouter
const codeBlockRoutes_1 = __importDefault(require("./routes/codeBlockRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI ||
    "mongodb+srv://onlinecoding:onlinecoding123@cluster0.oc0i33l.mongodb.net/?retryWrites=true&w=majority";
mongoose_1.default
    .connect(MONGO_URI, {})
    .then(() => {
    console.log("Connected to MongoDB");
})
    .catch((error) => {
    console.error("MongoDB connection error:", error.message);
});
// Basic Route for Testing
// app.get("/", (req, res) => {
//   res.send("Hello from Express with MongoDB!");
// });
//Seting routes
app.use("/api/codeblocks", codeBlockRoutes_1.default); // For code block related operations
app.use("/", lobbyRoutes_1.default); // No prefix for the root route
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
