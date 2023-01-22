import ListItem, { ListId, Username } from "./ListItem";
import Color from "parsegraph-color";
import Size from "parsegraph-size";

class MultislotPlot extends ListItem {
  _index: number;

  constructor(id: ListId, owner: Username) {
    super(id, owner);
  }

  setIndex(val: number) {
    this._index = val;
  }

  index() {
    return this._index;
  }

  type() {
    return "multislot::plot";
  }

  value() {
    return [this._index, 1];
  }

  items() {
    return [];
  }
}

class Multislot extends ListItem {
  _plots: MultislotPlot[];
  _color: Color;
  _size: Size;
  _subType: number;

  constructor(
    id: ListId,
    owner: Username,
    subType: number,
    rowSize: number,
    columnSize: number,
    r: number,
    g: number,
    b: number
  ) {
    super(id, owner);
    this._plots = [];
    this._color = new Color(r / 255, g / 255, b / 255);
    this._size = new Size(rowSize, columnSize);
    this._subType = subType;
  }

  getPlotByIndex(index: number) {
    return this._plots.find((plot) => plot.index() === index);
  }

  addPlot(plot: MultislotPlot) {
    if (this.getPlotByIndex(plot.index())) {
      throw new Error("Plot index already in use: " + plot.index());
    }
    this._plots.push(plot);
  }

  type() {
    return "multislot";
  }

  subType() {
    return this._subType;
  }

  size() {
    return this._size;
  }

  color() {
    return this._color;
  }

  value() {
    return [
      this.subType(),
      this.size().width(),
      this.size().height(),
      Math.floor(255 * this.color().r()),
      Math.floor(255 * this.color().g()),
      Math.floor(255 * this.color().b()),
    ];
  }

  items() {
    return this._plots;
  }
}

export default Multislot;
export { MultislotPlot };
