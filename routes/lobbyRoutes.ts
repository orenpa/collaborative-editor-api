import { Router } from "express";

//router object that will define routes
const router = Router();

//sets a route handler to HTTP request GET to the root path: the lobby
router.get("/", (req, res) => {
  res.json({ message: "Welcome to the Lobby" });
});

export default router;
