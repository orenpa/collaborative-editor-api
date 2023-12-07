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
dotenv.config();

const app = express();
app.use(cors());
const PORT = process.env.PORT || 5000;

//server
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
    methods: "*",
  },
});

let clients: any[] = [];
const codeBlockStates: Record<string, string> = {};

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

//Seting routes
app.use("/", lobbyRouter);
app.use("/api/codeblocks", codeBlockRouter);
server.listen(PORT, () => {
  console.log(`MongoDB URL: ${MONGO_URI}`);
  console.log(`Server running on http://localhost:${PORT}`);
});
