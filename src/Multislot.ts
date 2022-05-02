import Room, { ListType } from "./Room";
import Color from "parsegraph-color";
import { BlockCaret, BlockNode, copyStyle } from "parsegraph-block";
import { ActionCarousel } from "parsegraph-carousel";
import MultislotPlot from "./MultislotPlot";

export type MultislotSubtype = number;

export default class Multislot {
  _room: Room;
  _plots: MultislotPlot[];
  _id: number;

  _root: BlockNode;
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
    this._room = room;
    this._plots = [];
    this._id = null;

    const car = new BlockCaret("b");
    this._root = car.node();
    this._size = rowSize * columnSize;
    this._columnSize = columnSize;
    this._rowSize = rowSize;
    this._color = color;

    this.build(car, subtype);

    const multislotActions = new ActionCarousel(room.carousel());
    multislotActions.addAction(
      "Edit",
      ()=>{
        this.room().togglePermissions(this.id());
      },
      this
    );
    multislotActions.install(this.node());

    this._root.value().setLabel("" + subtype);
    this._subtype = subtype;
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

  node() {
    return this._root;
  }

  room() {
    return this._room;
  }

  scheduleUpdate() {
    return this.room().scheduleUpdate();
  }

  getPlot(index: number) {
    return this._plots[index];
  }

  private spawnPlot() {
    const index = this._plots.length;
    const plot = new MultislotPlot(this, index);
    this._plots.push(plot);
    return plot;
  };

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
        const plot = this.spawnPlot();
        car.connect("f", plot.node());
        car.move("f");
        // console.log(x + ", " + y);
      }
      car.pop();
      //car.crease();
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
        car.spawnMove("d", "u");
        car.replace("u");
        car.node().value().setBlockStyle(this.cs());
        car.pull("f");
        const plot = this.spawnPlot();
        car.connect("f", plot.node());
      }
      car.pop();
      car.pull("d");
      //car.crease();
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
        if (x > 0) {
          car.spawnMove("d", "u");
          car.node().value().setBlockStyle(this.cs());
        }
        car.spawnMove("d", "s");
        car.node().value().setBlockStyle(this.cs());
        const plot = this.spawnPlot();
        car.connect("f", plot.node());
        car.pull("f");
      }
      car.pop();
      car.pull("d");
      //car.crease();
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
        car.connect("b", plot.node());
      }
      car.pop();
      car.pull("d");
      //car.crease();
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
        car.connect("d", plot.node());
        car.pull("d");
        console.log(x + ", " + y);
      }
      car.pop();
      //car.crease();
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
  spawnItem(room: Room, value: any, children: any[], id: number) {
    const params = JSON.parse(value);
    const subtype = params[0];
    const rowSize = params[1];
    const columnSize = params[2];
    const color = new Color(params[3] / 255, params[4] / 255, params[5] / 255);
    const multislot = new Multislot(room, rowSize, columnSize, color, subtype);
    multislot.setId(id);
    for (let i = 0; i < children.length; ++i) {
      const child = children[i];
      console.log(child);
      if (child.type === "multislot::plot") {
        const plotData = JSON.parse(child.value);
        const plot = multislot.getPlot(plotData[0]);
        plot.setId(child.id);
        plot.claim(child.username);
        console.log(child);
      } else {
        throw new Error("Unexpected type: " + child.type);
      }
    }
    return multislot;
  }
}
