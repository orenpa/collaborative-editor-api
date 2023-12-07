import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import lobbyRouter from "./routes/lobbyRoutes";
import codeBlockRouter from "./routes/codeBlockRoutes";
import { Server as SocketIOServer } from "socket.io";
import http from "http";
import cors from "cors";
import CodeBlock from "./models/codeBlockModel";
import initialCodeBlocks from "./data/initialCodeBlocks";

//initialize enviroment for variables that will defined in .env for encapsulation
dotenv.config();

//express application
const app = express();
//CORS - allowing the server to accept requests from different domains
app.use(cors());

//defining the PORT number of which the server will listen for incoming connectios
const PORT = process.env.PORT || 5000;

//setting HTTP server
const server = http.createServer(app);
//socket.io is initialized to allow real-time comunication betwen clients and server
const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
    methods: "*",
  },
});

//list of clients to keep track on role assigment and server engagment
let clients: any[] = [];
//key-value dictionery to hold codeblockId and code, for code change handling
const codeBlockStates: Record<string, string> = {};

//listen upon clients connections and handle role assignment
io.on("connection", (socket) => {
  const role = clients.length === 0 ? "mentor" : "student";
  clients.push({ socketId: socket.id, role });
  console.log("New Client Connected");
  console.log(clients);

  //if some client request a role, lets give him one
  socket.on("request role", () => {
    const client = clients.find((c) => c.socketId === socket.id);
    if (client) {
      //let everybody knows that role assigned
      socket.emit("role assigned", client.role);
    }
  });

  //handling clients disconnection of the server
  socket.on("disconnect", () => {
    //asiginng a new mentor if the mentor disconects from server
    const wasMentor =
      clients.find((c) => c.socketId === socket.id).role === "mentor";
    clients = clients.filter((client) => client.socketId !== socket.id);

    if (wasMentor && clients.length > 0) {
      clients[0].role = "mentor";
      io.to(clients[0].socketId).emit("role assigned", "mentor");
    }

    if (clients.length === 0) {
      console.log("A client disconnected");
      console.log("0 Clients on Server");
    } else {
      console.log("A client disconnected");
    }
  });

  //listens to code changes
  socket.on("code change", (data) => {
    //sets modified code
    codeBlockStates[data.codeBlockId] = data.newCode;
    console.log("Code has changed!");
    //broadcast the code change to all clients except the sender
    socket.broadcast.emit("code change", data);
  });

  //handle code reset when a client pressed the button in Editor component
  socket.on("code reset", (data) => {
    codeBlockStates[data.codeBlockId] = data.newCode;
    //broadcast the code change to all clients except the sender
    //io.emit means high priority actios = reset the code fast to all clients
    io.emit("code change", data);
  });
});

// MongoDB Connection
const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb+srv://onlinecoding:onlinecoding123@cluster0.oc0i33l.mongodb.net/?retryWrites=true&w=majority";

mongoose
  .connect(MONGO_URI, {})
  .then(() => {
    console.log("Connected to MongoDB");
    initializeCodeBlocks();
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error.message);
  });

//uploading codeblocks (tasks) to mongoDB
async function initializeCodeBlocks() {
  try {
    const count = await CodeBlock.countDocuments({});
    if (count === 0) {
      await CodeBlock.insertMany(initialCodeBlocks);
      console.log("Initial code blocks added");
    }
  } catch (err) {
    console.error("Failed to initialize code blocks:", err);
  }
}

//Setting routes handlers
app.use("/", lobbyRouter);
app.use("/api/codeblocks", codeBlockRouter);

//start the server on specific port
//now server is listening to incoming requests
server.listen(PORT, () => {
  console.log(`MongoDB URL: ${MONGO_URI}`);
  console.log(`Server running on port: ${PORT}`);
});
