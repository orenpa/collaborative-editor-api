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
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const lobbyRoutes_1 = __importDefault(require("./routes/lobbyRoutes"));
const codeBlockRoutes_1 = __importDefault(require("./routes/codeBlockRoutes"));
const socket_io_1 = require("socket.io");
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const codeBlockModel_1 = __importDefault(require("./models/codeBlockModel"));
const initialCodeBlocks_1 = __importDefault(require("./data/initialCodeBlocks"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
const PORT = process.env.PORT || 5000;
//server
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*",
        methods: "*",
    },
});
let clients = [];
const codeBlockStates = {};
io.on("connection", (socket) => {
    const role = clients.length === 0 ? "mentor" : "student";
    clients.push({ socketId: socket.id, role });
    console.log("New Client Connected");
    console.log(clients);
    socket.on("request role", () => {
        const client = clients.find((c) => c.socketId === socket.id);
        if (client) {
            socket.emit("role assigned", client.role);
        }
    });
    socket.on("disconnect", () => {
        //asiginng a new mentor if the mentor disconects
        const wasMentor = clients.find((c) => c.socketId === socket.id).role === "mentor";
        clients = clients.filter((client) => client.socketId !== socket.id);
        if (wasMentor && clients.length > 0) {
            clients[0].role = "mentor";
            io.to(clients[0].socketId).emit("role assigned", "mentor");
        }
        if (clients.length === 0) {
            console.log("A client disconnected");
            console.log("0 Clients on Server");
        }
        else {
            console.log("A client disconnected");
        }
    });
    //listens to code changes
    socket.on("code change", (data) => {
        // console.log("Received code change event", data);
        codeBlockStates[data.codeBlockId] = data.newCode;
        // Broadcast the code change to all clients except the sender
        socket.broadcast.emit("code change", data);
    });
    socket.on("code reset", (data) => {
        codeBlockStates[data.codeBlockId] = data.newCode;
        // Broadcast the code change to all clients except the sender
        io.emit("code change", data);
    });
});
// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI ||
    "mongodb+srv://onlinecoding:onlinecoding123@cluster0.oc0i33l.mongodb.net/?retryWrites=true&w=majority";
mongoose_1.default
    .connect(MONGO_URI, {})
    .then(() => {
    console.log("Connected to MongoDB");
    initializeCodeBlocks();
})
    .catch((error) => {
    console.error("MongoDB connection error:", error.message);
});
function initializeCodeBlocks() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const count = yield codeBlockModel_1.default.countDocuments({});
            if (count === 0) {
                yield codeBlockModel_1.default.insertMany(initialCodeBlocks_1.default);
                console.log("Initial code blocks added");
            }
        }
        catch (err) {
            console.error("Failed to initialize code blocks:", err);
        }
    });
}
//Seting routes
app.use("/", lobbyRoutes_1.default);
app.use("/api/codeblocks", codeBlockRoutes_1.default);
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
