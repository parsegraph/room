import Navport, { render } from "parsegraph-viewport";
import Room, { getRoomName } from "./index";
import { MultislotType } from "./Multislot";
import TreeNode, {
  BlockTreeNode,
  FunctionalTreeNode,
} from "parsegraph-treenode";
import ParsegraphStream from "parsegraph-stream";
import { BlockCaret } from "parsegraph-block";
import Direction from "parsegraph-direction";

document.addEventListener("DOMContentLoaded", () => {
  const topElem = document.getElementById("room");
  topElem.style.position = "relative";

  const viewport = new Navport(null);
  const room = new Room(viewport, getRoomName());
  room.addItemSpawner("multislot", new MultislotType());
  room.addItemSpawner("lisp", (_, value) => {
    return new BlockTreeNode("b", value);
  });
  room.addItemSpawner("server", (_, value) => {
    const parsed = JSON.parse(value).split("/");
    const roomId = parsed[0];
    parsed.shift();
    const subPath = "/" + parsed.join("/");

    const treenode = new BlockTreeNode("b", `${roomId}/${subPath}`);
    const stream = new ParsegraphStream(viewport);
    stream.setPrefix(window.location.href + "/" + roomId);
    stream.setOnRoot((node) => {
      treenode.root().connectNode(Direction.DOWNWARD, node);
      viewport.scheduleRepaint();
    });
    stream.populate(subPath);
    return treenode;
  });
  viewport.setRoot(room.node());
  viewport.showInCamera(room.node());
  room.setOnScheduleUpdate(() => {
    viewport.scheduleRepaint();
  });
  render(topElem, viewport);
});
