import ListItem, { Username, ListId } from "./ListItem";
import Multislot, { MultislotPlot } from "./Multislot";
import { v4 as uuid } from "uuid";

class World extends ListItem {
  _worldId: string;
  _streams: ((val: any) => void)[];
  _idCounter: number;

  _multislots: Multislot[];

  constructor(worldId: string, owner: Username) {
    super(0, owner);
    this._idCounter = 1;
    this._worldId = worldId;
    this._owner = owner;
    this._streams = [];
    this._multislots = [];
  }

  addMultislot(
    owner: Username,
    subType: number,
    rowSize: number,
    columnSize: number,
    r: number,
    g: number,
    b: number,
    guid: string = null
  ) {
    const ms = new Multislot(
      this.nextId(),
      owner,
      subType,
      rowSize,
      columnSize,
      r,
      g,
      b
    );
    this._multislots.push(ms);
    this.send({
      event: "pushListItem",
      eventGUID: guid,
      list_id: this.id(),
      username: owner,
      item_id: ms.id(),
      item: ms.toJSON(),
    });
    return ms;
  }

  items() {
    return this._multislots;
  }

  type() {
    return "world";
  }

  value() {
    return this.worldId();
  }

  world() {
    return this;
  }

  worldId() {
    return this._worldId;
  }

  nextId() {
    return this._idCounter++;
  }

  getMultislot(id: ListId) {
    return this._multislots.find((ms) => ms.id() == id);
  }

  command(requestor: Username, request: any) {
    switch (request.command) {
      case "pushListItem":
        const ms = this.getMultislot(request.list_id);
        if (!ms) {
          throw new Error("Unknown multislot");
        }
        if (request.type !== "multislot::plot") {
          throw new Error("Multislots only accept plots as children");
        }
        const newId = this.nextId();
        const plot = new MultislotPlot(newId, requestor);
        const val = JSON.parse(request.value);
        plot.setIndex(val[0]);
        ms.addPlot(plot);
        this.send({
          event: "pushListItem",
          eventGUID: request.guid,
          list_id: ms.id(),
          username: requestor,
          item_id: plot.id(),
          item: plot.toJSON(),
        });
        return {
          result: true,
          eventGUID: request.guid,
        };
      default:
        throw new Error("Unrecognized event: " + request.command);
    }
  }

  send(event: any) {
    this._streams.forEach((stream) => stream(event));
  }

  connect(username: string, stream: (event: any) => void) {
    const session = uuid();
    this._streams.push(stream);
    stream({
      event: "sessionStarted",
      guid: session,
    });
    stream({
      event: "join",
      username: username,
    });
    stream({
      event: "initialData",
      root: this.toJSON(),
    });
    return () => {
      this._streams = this._streams.filter((curStream) => {
        return curStream !== stream;
      });
    };
  }
}

export default World;
