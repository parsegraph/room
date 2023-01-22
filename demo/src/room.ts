import { Router } from "express";
import { v4 as uuid } from "uuid";
import bodyParser from "body-parser";
import World from "./World";

const username = "rainback";

const router = new Router();

const worlds: { [worldId: string]: World } = {};

router.post("/@:world", bodyParser.json(), (req, res) => {
  const worldId = req.params.world;
  const request = req.body;
  const world = worlds[worldId];
  if (!world) {
    res.end(404);
    return;
  }
  try {
    const resp = world.command(username, request);
    res.end(JSON.stringify(resp));
  } catch (ex) {
    res.status(400).end(ex);
  }
});

router.get("/@:world/live", (req, res) => {
  const worldId = req.params.world;
  res.status(200).set({
    connection: "keep-alive",
    "cache-control": "no-cache",
    "Content-Type": "text/event-stream",
  });

  const writeObj = (obj: any) => {
    res.write(`data: ${JSON.stringify(obj)}\n\n`);
  };

  if (!worlds[worldId]) {
    const world = new World(worldId, username);
    world.addMultislot(username, 0, 6, 6, 255, 255, 255);
    world.addMultislot(username, 1, 6, 6, 255 * 0.75, 255 * 0.75, 255 * 0.75);
    world.addMultislot(username, 2, 6, 6, 255 * 0.5, 255 * 0.5, 255 * 0.5);
    world.addMultislot(username, 3, 6, 6, 255 * 0.25, 255 * 0.25, 255 * 0.25);
    world.addMultislot(username, 4, 6, 6, 0, 0, 0);
    worlds[worldId] = world;
  }
  const remover = worlds[worldId].connect(username, writeObj);
  res.on("close", remover);
});

export default router;
