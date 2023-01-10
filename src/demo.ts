import Navport, { render } from "parsegraph-viewport";
import Room, { getRoomName } from "./index";
import { MultislotType } from "./Multislot";

document.addEventListener("DOMContentLoaded", () => {
  const topElem = document.getElementById("room");
  topElem.style.position = "relative";

  const viewport = new Navport(null);
  const room = new Room(viewport, getRoomName());
  room.setUsername("aaronfaanes");
  room.addLoader("multislot", new MultislotType());
  room.load([
    {
      id: "1",
      type: "multislot",
      value: JSON.stringify([0, 6, 6, 255, 255, 255]),
      items: [],
    },
    {
      id: "2",
      type: "multislot",
      value: JSON.stringify([1, 6, 6, 0.75 * 255, 0.75 * 255, 0.75 * 255]),
      items: [],
    },
    {
      id: "3",
      type: "multislot",
      value: JSON.stringify([2, 6, 6, 0.5 * 255, 0.5 * 255, 0.5 * 255]),
      items: [],
    },
    {
      id: "4",
      type: "multislot",
      value: JSON.stringify([3, 6, 6, 0.25 * 255, 0.25 * 255, 0.25 * 255]),
      items: [],
    },
    {
      id: "5",
      type: "multislot",
      value: JSON.stringify([4, 6, 6, 0, 0, 0]),
      items: [],
    },
  ]);
  viewport.setRoot(room.node());
  viewport.showInCamera(room.node());
  room.setOnScheduleUpdate(()=>viewport.scheduleRepaint());
  render(topElem, viewport);
});
