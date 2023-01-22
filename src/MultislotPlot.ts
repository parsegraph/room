import {
  BlockCaret,
  BlockStyle,
  copyStyle,
  DefaultBlockPalette,
} from "parsegraph-block";
import { ActionCarousel } from "parsegraph-viewport";
import Color from "parsegraph-color";
import Multislot from "./Multislot";
import Direction from "parsegraph-direction";
import TreeNode, { Spawner, BlockTreeNode } from "parsegraph-treenode";
import { v4 as uuid } from "uuid";

export default class MultislotPlot extends TreeNode {
  _multislot: Multislot;
  _index: number;
  _version: number;
  _id: string | number;
  _claimant: string;

  _children: Spawner;

  _unclaimedStyle: BlockStyle;
  _claimedStyle: BlockStyle;

  _unclaimedActions: ActionCarousel;
  _populatedActions: ActionCarousel;
  _claimedActions: ActionCarousel;

  _actionRemover: any;

  _palette: DefaultBlockPalette;

  constructor(multislot: Multislot, index: number) {
    super(multislot.nav());
    this.setOnScheduleUpdate(() => multislot.invalidate());
    this._index = index;
    this._multislot = multislot;
    this._version = 0;
    this._id = null;
    this._claimant = null;

    this._palette = new DefaultBlockPalette();
    this._children = new Spawner(multislot.room().nav(), []);
    this._children.setBuilder(() => {
      const n = new BlockTreeNode("u");

      const ac = new ActionCarousel(
        multislot.room().nav().carousel(),
        this._palette
      );
      ac.addAction("Lisp", () => {
        this.room().pushListItem(this.id(), "lisp", "(hello world)");
      });
      ac.addAction("Audio", () => {
        this.room().pushListItem(this.id(), "audio", "");
      });
      ac.addAction("Calendar", () => {
        this.room().pushListItem(this.id(), "calendar", "");
      });
      ac.addAction("Server", () => {
        this.room().pushListItem(this.id(), "server", uuid());
      });
      ac.install(n.root());
      return n;
    });

    const bs = copyStyle("s");
    bs.backgroundColor = multislot.color();
    this._unclaimedStyle = bs;

    this._claimedStyle = copyStyle("s");
    this._claimedStyle.backgroundColor = new Color(1, 1, 1);

    const carousel = multislot.room().carousel();
    this._unclaimedActions = new ActionCarousel(carousel);
    this._unclaimedActions.addAction("Claim", () => {
      const room = this._multislot.room();
      const username = room.username();
      if (!username) {
        throw new Error("Room must have a valid username");
      }
      console.log("Claiming for " + username);
      this.room().submit(new ClaimPlotAction(this, username));
    });

    const addDefaultActions = (ac: ActionCarousel) => {
      ac.addAction("Edit", () => {
        this.room().togglePermissions(this.id());
      });
      ac.addAction("Unclaim", () => {
        this.room().submit(new UnclaimPlotAction(this));
      });
    };
    this._populatedActions = new ActionCarousel(carousel);
    addDefaultActions(this._populatedActions);

    this._claimedActions = new ActionCarousel(carousel);
    this._claimedActions.addAction("Lisp", () => {
      this.room().pushListItem(this.id(), "lisp", "");
    });
    addDefaultActions(this._claimedActions);
  }

  render() {
    const car = new BlockCaret("s");
    car.label(String(this._index));

    if (this.isClaimed()) {
      console.log("Rendering claimed plot");
      car.spawn("d", "b");
      car.pull("d");
      car.move("d");
      car.node().value().setLabel(this.claimant());
      car.node().value().setBlockStyle(this._claimedStyle);
      car.align("d", "c");
      car.node().connectNode(Direction.DOWNWARD, this._children.root());
      const n = car.node();
      this._children.setOnScheduleUpdate(() => {
        n.connectNode(Direction.DOWNWARD, this._children.root());
        this.invalidate();
      });
    } else {
      console.log("Rendering unclaimed plot");
      car.spawn("d", "u");
      car.pull("d");
      car.move("d");
      car.node().value().setLabel("");
      car.node().value().setBlockStyle(this._unclaimedStyle);
      this._unclaimedActions.install(car.node());
    }

    return car.root();
  }

  setId(id: number | string) {
    this._id = id;
  }

  id() {
    return this._id;
  }

  isClaimed() {
    return this.claimant() !== null;
  }

  claimant() {
    return this._claimant;
  }

  children() {
    return this._children;
  }

  claim(name: string) {
    console.log("Plot claimed for " + name);
    this._claimant = name;
    this.invalidate();
  }

  populate() {}

  depopulate() {}

  unclaim() {
    this._claimant = null;
    this.invalidate();
  }

  multislot() {
    return this._multislot;
  }

  room() {
    return this._multislot.room();
  }

  version() {
    return this._version;
  }

  nextVersion() {
    return ++this._version;
  }

  index() {
    return this._index;
  }
}

class ClaimPlotAction {
  _plot: MultislotPlot;
  _username: string;
  _originalClaimant: string;
  _listener: Function;
  _listenerThisArg: any;
  _version: number;

  constructor(plot: MultislotPlot, username: string) {
    this._plot = plot;
    this._username = username;
    this._originalClaimant = null;
  }

  setListener(cb: () => void, cbThisArg?: any) {
    if (this._listener) {
      console.log("Refusing to overwrite existing listener");
      console.log("Original listener:");
      console.log(this._listener, this._listenerThisArg);
      console.log("New listener:");
      console.log(cb, cbThisArg);
      throw new Error("Refusing to overwrite existing listener");
    }
    this._listener = cb;
    this._listenerThisArg = cbThisArg;
  }

  room() {
    return this._plot.room();
  }

  multislot() {
    return this._plot.multislot();
  }

  advance() {
    console.log("Advancing plot claim");
    const multislotId = this.room().getId(this.multislot());
    if (multislotId === null) {
      console.log("No multislot");
      return false;
    }
    this._originalClaimant = this._plot.claimant();
    this._version = this._plot.version();
    this._plot.claim(this._username);
    this.room().pushListItem(
      multislotId,
      "multislot::plot",
      [this._plot.index(), 1],
      this.receive,
      this
    );
    return true;
  }

  reverse() {
    console.log("Reversing plot claim");
    if (this._plot.version() !== this._version) {
      // Preempted.
      return false;
    }
    if (this._originalClaimant) {
      this._plot.claim(this._originalClaimant);
    } else {
      this._plot.unclaim();
    }
    return true;
  }

  receive(err: any) {
    console.log("Received plot claim response: " + err);
    if (err) {
      this.reverse();
    } else {
      this._plot.nextVersion();
    }
    if (this._listener) {
      this._listener.call(this._listenerThisArg);
    }
  }
}

class UnclaimPlotAction {
  _plot: MultislotPlot;
  _originalClaimant: string;
  _listener: Function;
  _listenerThisArg: any;
  _version: number;

  constructor(plot: MultislotPlot) {
    this._plot = plot;
    this._originalClaimant = null;
  }

  setListener(cb: () => void, cbThisArg?: any) {
    if (this._listener) {
      throw new Error("Refusing to overwrite existing listener");
    }
    this._listener = cb;
    this._listenerThisArg = cbThisArg;
  }

  room() {
    return this._plot.room();
  }

  multislot() {
    return this._plot.multislot();
  }

  advance() {
    const multislotId = this.room().getId(this.multislot());
    if (multislotId === null) {
      return false;
    }
    this._originalClaimant = this._plot.claimant();
    this._version = this._plot.version();
    this._plot.unclaim();
    this.room().destroyListItem(this._plot.id(), this.receive, this);
    return true;
  }

  reverse() {
    if (this._plot.version() !== this._version) {
      // Preempted.
      return false;
    }
    if (this._originalClaimant) {
      this._plot.claim(this._originalClaimant);
    } else {
      this._plot.unclaim();
    }
    return true;
  }

  receive(err: any) {
    if (err) {
      this.reverse();
    } else {
      this._plot.nextVersion();
    }
    if (this._listener) {
      this._listener.call(this._listenerThisArg);
    }
  }
}
