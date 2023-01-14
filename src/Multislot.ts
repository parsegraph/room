import Room, { ListType } from "./Room";
import Color from "parsegraph-color";
import { BlockCaret, copyStyle } from "parsegraph-block";
import { ActionCarousel } from "parsegraph-viewport";
import MultislotPlot from "./MultislotPlot";
import TreeNode from "parsegraph-treenode";
import { ListItem } from "./Room";
import Direction from "parsegraph-direction";

export type MultislotSubtype = number;

export default class Multislot extends TreeNode {
  _room: Room;
  _plots: MultislotPlot[];
  _id: number;

  _columnSize: number;
  _rowSize: number;
  _size: number;
  _color: Color;
  _subtype: MultislotSubtype;

  constructor(
    room: Room,
    rowSize: number,
    columnSize: number,
    color: Color,
    subtype: MultislotSubtype
  ) {
    super(room.nav());
    this._room = room;
    this._plots = [];
    this._id = null;

    this._size = rowSize * columnSize;
    this._columnSize = columnSize;
    this._rowSize = rowSize;
    this._color = color;
    this._subtype = subtype;
    this.setOnScheduleUpdate(() => room.scheduleUpdate());
  }

  render() {
    const car = new BlockCaret("b");
    this.build(car, this._subtype);

    const multislotActions = new ActionCarousel(this.nav().carousel());
    multislotActions.addAction(
      "Edit",
      () => {
        this.room().togglePermissions(this.id());
      },
      this
    );
    multislotActions.install(car.root());

    car.label(String(this._subtype));
    return car.root();
  }

  setId(id: number) {
    this._id = id;
  }

  id() {
    return this._id;
  }

  color() {
    return this._color;
  }

  room() {
    return this._room;
  }

  getPlot(index: number) {
    if (this.needsUpdate()) {
      this.root();
    }
    return this._plots[index];
  }

  private spawnPlot() {
    const index = this._plots.length;
    const plot = new MultislotPlot(this, index);
    this._plots.push(plot);
    return plot;
  }

  cs() {
    const cs = copyStyle("u");
    cs.backgroundColor = new Color(0.8);
    cs.borderColor = new Color(0.6);
    return cs;
  }

  build0(car: BlockCaret) {
    for (let y = 0; y < this._columnSize; ++y) {
      if (y === 0) {
        car.pull("d");
        car.align("d", "c");
        car.spawnMove("d", "u");
        car.shrink();
      } else {
        car.spawnMove("d", "u");
      }
      car.pull("f");
      car.replace("u");
      car.node().value().setBlockStyle(this.cs());
      if (y === 0) {
        car.shrink();
      }
      car.push();
      for (let x = 0; x < this._rowSize; ++x) {
        (() => {
          const plot = this.spawnPlot();
          car.connect("f", plot.root());
          const n = car.node();
          plot.setOnScheduleUpdate(() => {
            n.connectNode(Direction.FORWARD, plot.root());
          });
          car.move("f");
          // console.log(x + ", " + y);
        })();
      }
      car.pop();
      // car.crease();
    }
  }

  build1(car: BlockCaret) {
    car.align("d", "c");
    car.pull("d");
    car.spawnMove("d", "u");

    for (let y = 0; y < this._columnSize; ++y) {
      if (y === 0) {
        // car.align('d', parsegraph_ALIGN_CENTER);
        car.shrink();
      } else {
        car.spawnMove("f", "u");
      }
      car.replace("u");
      car.node().value().setBlockStyle(this.cs());
      if (y === 0) {
        car.shrink();
      }
      car.push();
      for (let x = 0; x < this._rowSize; ++x) {
        (() => {
          car.spawnMove("d", "u");
          car.replace("u");
          car.node().value().setBlockStyle(this.cs());
          car.pull("f");
          const plot = this.spawnPlot();
          const n = car.node();
          plot.setOnScheduleUpdate(() => {
            n.connectNode(Direction.FORWARD, plot.root());
          });
          car.connect("f", plot.root());
        })();
      }
      car.pop();
      car.pull("d");
      // car.crease();
    }
  }

  build2(car: BlockCaret) {
    car.align("d", "c");
    car.pull("d");
    // car.spawnMove('d', 'u');

    for (let y = 0; y < this._columnSize; ++y) {
      if (y === 0) {
        car.align("d", "c");
        car.spawnMove("d", "u");
        car.shrink();
      } else {
        car.spawnMove("f", "u");
      }
      car.node().value().setBlockStyle(this.cs());
      if (y === 0) {
        car.shrink();
      }
      car.push();
      for (let x = 0; x < this._rowSize; ++x) {
        (() => {
          if (x > 0) {
            car.spawnMove("d", "u");
            car.node().value().setBlockStyle(this.cs());
          }
          car.spawnMove("d", "s");
          car.node().value().setBlockStyle(this.cs());
          const plot = this.spawnPlot();
          car.connect("f", plot.root());
          const n = car.node();
          plot.setOnScheduleUpdate(() => {
            n.connectNode(Direction.FORWARD, plot.root());
          });
          car.pull("f");
        })();
      }
      car.pop();
      car.pull("d");
      // car.crease();
    }
  }

  build3(car: BlockCaret) {
    car.align("d", "c");
    car.pull("d");
    // car.spawnMove('d', 'u');

    for (let y = 0; y < this._columnSize; ++y) {
      if (y === 0) {
        car.align("d", "c");
        car.spawnMove("d", "u");
        car.shrink();
      } else {
        car.spawnMove("f", "u");
      }
      car.node().value().setBlockStyle(this.cs());
      if (y === 0) {
        car.shrink();
      }
      car.push();
      for (let x = 0; x < this._rowSize; ++x) {
        if (x > 0) {
          car.spawnMove("d", "u");
          car.node().value().setBlockStyle(this.cs());
        }
        car.spawnMove("d", "s");
        car.node().value().setBlockStyle(this.cs());
        car.pull("b");
        const plot = this.spawnPlot();
        car.connect("b", plot.root());
        ((n) => {
          plot.setOnScheduleUpdate(() => {
            n.connectNode(Direction.BACKWARD, plot.root());
          });
        })(car.node());
      }
      car.pop();
      car.pull("d");
      // car.crease();
    }
  }

  bs() {
    const bs = copyStyle("b");
    bs.backgroundColor = this._color;
    return bs;
  }

  build4(car: BlockCaret) {
    for (let y = 0; y < this._columnSize; ++y) {
      if (y === 0) {
        car.pull("d");
        car.align("d", "c");
        car.spawnMove("d", "u");
        car.shrink();
      } else {
        car.spawnMove("d", "u");
      }
      car.pull("b");
      car.replace("u");
      car.node().value().setBlockStyle(this.cs());
      if (y === 0) {
        car.shrink();
      }
      car.push();
      for (let x = 0; x < this._rowSize; ++x) {
        car.spawnMove("b", "s");
        car.node().value().setBlockStyle(this.cs());
        const plot = this.spawnPlot();
        ((n) => {
          car.connect("d", plot.root());
          plot.setOnScheduleUpdate(() => {
            n.connectNode(Direction.DOWNWARD, plot.root());
          });
        })(car.node());
        car.pull("d");
        console.log(x + ", " + y);
      }
      car.pop();
      // car.crease();
    }
  }

  build(car: BlockCaret, subtype: MultislotSubtype) {
    const us = copyStyle("u");
    us.backgroundColor = this._color;
    if (subtype === 0) {
      this.build0(car);
    } else if (subtype === 1) {
      this.build1(car);
    } else if (subtype === 2) {
      this.build2(car);
    } else if (subtype === 3) {
      this.build3(car);
    } else if (subtype === 4) {
      this.build4(car);
    } else {
      throw new Error("Subtype not recognized");
    }
  }
}

export class MultislotType implements ListType {
  spawnItem(room: Room, value: any, items: ListItem[], id: number) {
    const params = JSON.parse(value);
    const subtype = params[0];
    const rowSize = params[1];
    const columnSize = params[2];
    const color = new Color(params[3] / 255, params[4] / 255, params[5] / 255);
    const multislot = new Multislot(room, rowSize, columnSize, color, subtype);
    multislot.setId(id);
    const claimPlot = (child: ListItem) => {
      console.log(child);
      const plotData = JSON.parse(child.value);
      const plot = multislot.getPlot(plotData[0]);
      plot.setId(child.id);
      plot.claim(child.username);
      child.items.forEach((item) => {
        const elem = room.spawnItem(item.id, item.type, item.value, item.items);
        plot.children().appendChild(elem);
      });
      room.listen(child.id, (e: any) => {
        switch (e.event) {
          case "pushListItem":
            const elem = room.spawnItem(
              e.item.id,
              e.item.type,
              e.item.value,
              e.item.items
            );
            plot.children().appendChild(elem);
            room.scheduleUpdate();
            break;
          default:
            console.log("Plot event", child.id, e);
        }
      });
      room.scheduleUpdate();
    };
    for (let i = 0; i < items.length; ++i) {
      const child = items[i];
      console.log(child);
      if (child.type === "multislot::plot") {
        claimPlot(child);
      } else {
        throw new Error("Unexpected type: " + child.type);
      }
    }
    room.listen(id, (e: any) => {
      switch (e.event) {
        case "pushListItem":
          if (e.item.type === "multislot::plot") {
            claimPlot(e.item);
          }
          break;
        default:
          console.log("Multislot event", e);
      }
    });
    return multislot;
  }
}
