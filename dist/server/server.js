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
const testRoutes_1 = __importDefault(require("./routes/testRoutes"));
const socket_io_1 = require("socket.io");
const http_1 = __importDefault(require("http"));
const initialCodeBlocks_1 = require("./data/initialCodeBlocks"); // Adjust the path as necessary
dotenv_1.default.config();
const app = (0, express_1.default)();
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
    console.log("New client connected", socket.id);
    const role = clients.length === 0 ? "mentor" : "student";
    clients.push({ socketId: socket.id, role });
    console.log("in server,roll asigning. clients: ", clients);
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
            console.log("in server roll assigned", clients);
        }
        console.log("A client disconnected");
    });
    //listens to code changes
    socket.on("code change", (data) => {
        // console.log("Received code change event", data);
        // Broadcast the code change to all clients except the sender
        codeBlockStates[data.codeBlockId] = data.newCode;
        socket.broadcast.emit("code change", data);
    });
    socket.on("requestInitialCode", (data) => {
        const initialCode = codeBlockStates[data.codeBlockId] || "";
        socket.emit("initialCode", initialCode);
    });
});
// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI ||
    "mongodb+srv://onlinecoding:onlinecoding123@cluster0.oc0i33l.mongodb.net/?retryWrites=true&w=majority";
mongoose_1.default
    .connect(MONGO_URI, {})
    .then(() => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Connected to MongoDB");
    const count = yield CodeBlockType_1.CodeBlock.countDocuments();
    if (count === 0) {
        yield CodeBlockType_1.CodeBlock.insertMany(initialCodeBlocks_1.initialCodeBlocks);
        console.log("Initialized codeblocks in the database");
    }
}))
    .catch((error) => {
    console.error("MongoDB connection error:", error.message);
});
//Seting routes
app.use("/api/codeblocks", codeBlockRoutes_1.default);
app.use("/", lobbyRoutes_1.default);
app.use("/api", testRoutes_1.default);
// Allow requests from the client's origin
// app.use(cors());
// app.use(
//   cors({
//     origin: "http://localhost:3000", // Set the origin to your client's URL
//     methods: ["GET", "POST"], // Adjust the methods based on your needs
//   })
// );
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
