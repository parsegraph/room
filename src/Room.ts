import { BlockCaret, BlockNode, DefaultBlockPalette } from "parsegraph-block";
import Direction from "parsegraph-direction";
import { elapsed } from "parsegraph-timing";
import Method from "parsegraph-method";
import Navport from "parsegraph-viewport";
import TreeNode, { BlockTreeNode } from "parsegraph-treenode";

const START_TIME = new Date();

export type ListId = string | number;

export interface ListItem {
  id: string;
  type: string;
  username?: string;
  value: any;
  items: ListItem[];
}

export interface ListType {
  spawnItem(room: Room, value: any, children: ListItem[], id: ListId): TreeNode;
}

export type ItemSpawner = (
  room: Room,
  value: any,
  children: ListItem[],
  id: ListId
) => TreeNode;

export function getRoomName() {
  const atSymbol = document.URL.lastIndexOf("/@");
  if (atSymbol < 0) {
    return "default";
  }
  let ROOM_ID = document.URL.substring(atSymbol + 2);
  if (ROOM_ID.indexOf("?") >= 0) {
    ROOM_ID = ROOM_ID.substring(0, ROOM_ID.indexOf("?"));
  }
  return ROOM_ID;
}

export default class Room {
  _roomId: string;
  _eventSource: EventSource;
  _root: BlockNode;
  _itemListeners: any;
  _items: Map<ListId, TreeNode>;
  _ids: any;
  _actions: any[];
  _firedActions: any;
  _username: string;
  _sessionId: string;
  _update: Method;
  _itemSpawners: Map<string, ItemSpawner>;
  _nav: Navport;

  carousel() {
    return this._nav.carousel();
  }

  nav() {
    return this._nav;
  }

  constructor(nav: Navport, roomId: string = null) {
    this._nav = nav;
    this._root = new DefaultBlockPalette().spawn();
    this._itemSpawners = new Map();
    this._update = new Method();

    console.log("Creaitng room");
    if (roomId) {
      console.log("loading room: " + roomId);
      this._roomId = roomId;
      this._eventSource = new EventSource("/@" + this._roomId + "/live");
      this._eventSource.onmessage = (e) => {
        try {
          const obj = JSON.parse(e.data);
          // console.log("Found message!", obj);
          this.processMessage(obj);
        } catch (ex) {
          console.log(
            "Failed to read message. Error: ",
            ex,
            "Message:",
            e.data
          );
        }
      };
      this._root.value().setLabel(roomId);
    }

    this._itemListeners = {};
    this._items = new Map();
    if (window.WeakMap) {
      this._ids = new WeakMap();
    } else {
      this._ids = null;
    }
    this._actions = [];
    this._firedActions = 0;

    const bg = document.createElement("div");
    bg.className = "bg";

    const container = document.createElement("div");
    container.className = "popup";
    bg.appendChild(container);

    /* addEventListener(container, "submit", function(e) {
        e.preventDefault();
        return false;
    }, this);

    addEventListener(bg, "click", function() {
        if(bg.parentNode) {
            bg.parentNode.removeChild(bg);
        }
    });
    addEventListener(container, "click", function(e) {
        e.stopImmediatePropagation();
    });

    var permissionForm = new parsegraph_PermissionsForm(this);
    container.appendChild(permissionForm.container());

    var shownPermissionId = null;
    this.togglePermissions = function(plotId) {
        if(!plotId) {
            throw new Error("Plot ID must be provided when showing permissions");
        }
        this.scheduleRepaint();
        if(shownPermissionId == plotId && bg.parentNode) {
            bg.parentNode.removeChild(bg);
            shownPermissionId = null;
            return;
        }
        document.body.appendChild(bg);
        permissionForm.refresh(plotId);
        shownPermissionId = plotId;
    };*/

    this._username = null;
  }

  togglePermissions(_: any) {
    alert("Toggle permissions");
  }

  node() {
    return this._root;
  }

  setOnScheduleUpdate(func: Function, obj?: object) {
    this._update.set(func, obj);
  }

  scheduleUpdate() {
    this._update.call();
  }

  load(items: ListItem[]) {
    this._root.disconnectNode(Direction.DOWNWARD);
    const car = new BlockCaret(this._root);
    car.spawnMove("d", "u", "c");

    if (items.length === 0) {
      car.disconnect("d");
      car.align("d", "c");
      const node = car.spawnMove("d", "bu");
      car.onClick(() => {
        console.log("Creating carousel", node);
        /* var carousel = viewport.carousel();
              carousel.clearCarousel();
              carousel.moveCarousel(
                  node.absoluteX(),
                  node.absoluteY()
              );
              carousel.showCarousel();

              // Action actionNode, infoDescription, actionFunc, actionFuncThisArg
              var actionNode = new parsegraph_Node(parsegraph_BLOCK);
              actionNode.setLabel("Prepopulate", this.font());
              carousel.addToCarousel(actionNode, function() {
                  this.prepopulate(this, function(success, resp) {
                      //console.log(success, resp);
                  }, this);
              }, this);
              viewport.carousel().scheduleCarouselRepaint();*/
        return false;
      });
      car.move("u");
      car.pull("d");
    }

    for (let i = 0; i < items.length; ++i) {
      if (i > 0) {
        car.spawnMove("f", "u");
      }
      car.push();
      car.pull("d");
      ((item: ListItem) => {
        const widget = this.spawnItem(
          item.id,
          item.type,
          item.value,
          item.items
        );
        car.connect("d", widget.root());
        const n = car.node();
        widget.setOnScheduleUpdate(() => {
          n.connectNode(Direction.DOWNWARD, widget.root());
          this.scheduleUpdate();
        });
      })(items[i]);
      car.pop();
    }
    this.scheduleUpdate();
  }

  username() {
    return this._username;
  }

  setUsername(username: string) {
    this._username = username;
  }

  processMessage(obj: any) {
    if (obj.event === "sessionStarted") {
      this._sessionId = obj.guid;
      /* if(!this._cameraProtocol) {
              this._cameraProtocol = new parsegraph_InputProtocol(this.roomId(), this.sessionId(), this.graph().input());
          }*/
      console.log("Time till session start: " + elapsed(START_TIME));
    } else if (obj.event === "initialData") {
      this.load(obj.root.items);
    } else if (obj.event === "join") {
      this.setUsername(obj.username);
    } else if (obj.event == "parsegraph_editItem") {
      /* else if(obj.event === "camera_move") {
          if(userLogin.username === obj.username) {
              return;
          }
          var cb = this._graph.cameraBox();
          cb.setCamera(obj.username, {
              "cameraX":obj.x,
              "cameraY":obj.y,
              "height":obj.height,
              "scale":obj.scale,
              "width":obj.width,
          });
      }
      else if(obj.event == "mouse_move") {
          if(userLogin.username === obj.username) {
              return;
          }
          var cb = this._graph.cameraBox();
          cb.setCameraMouse(obj.username, obj.x, obj.y);
      }*/
      this.onItemEvent(obj.item_id, obj);
    } else if (obj.event == "pushListItem") {
      this.onItemEvent(obj.list_id, obj);
    } else if (obj.event == "destroyListItem") {
      this.onItemEvent(obj.item_id, obj);
    } else if (obj.event == "prepopulate") {
      window.location.replace(window.location.href);
    } else {
      console.log("Unknown event: ", obj);
    }
  }

  roomId() {
    return this._roomId;
  }

  sessionId() {
    return this._sessionId;
  }

  addItemSpawner(type: string, klass: ListType | ItemSpawner) {
    if (typeof klass !== "function") {
      const obj: ListType = klass;
      klass = (...args) => {
        return obj.spawnItem(...args);
      };
    }
    this._itemSpawners.set(type, klass);
  }

  getItemSpawner(type: string) {
    return this._itemSpawners.get(type);
  }

  spawnItem(id: ListId, type: string, value: any, items: any[]) {
    const itemSpawner = this.getItemSpawner(type);
    if (!itemSpawner) {
      return new BlockTreeNode("b", "Block type not recognized: " + type);
    }
    if (this._items.has(id)) {
      throw new Error("Item was already spawned:" + id);
    }
    return this.register(itemSpawner(this, value, items, id), id);
  }

  getId(item: TreeNode) {
    if (this._ids) {
      const val = this._ids.get(item);
      if (val) {
        return val;
      }
      return null;
    }
    let foundId = null;
    this._items.forEach((val: TreeNode, key: ListId) => {
      if (item === val) {
        foundId = key;
      }
    });
    return foundId;
  }

  register(item: TreeNode, id: ListId) {
    if (this._items.has(id)) {
      if (this._items.get(id) !== item) {
        throw new Error("Refusing to overwrite item " + id + " with " + item);
      }
      return item;
    }
    this._items.set(id, item);
    if (this._ids) {
      this._ids.set(item, id);
    }
    return item;
  }

  unregister(id: ListId) {
    if (!this._items.has(id)) {
      return null;
    }
    const item = this._items.get(id);
    this._items.delete(id);
    delete this._itemListeners[id];
    if (this._ids) {
      this._ids.delete(item);
    }
    return item;
  }

  onItemEvent(id: ListId, event: any) {
    const listeners = this._itemListeners[id];
    if (listeners) {
      // console.log("Listeners for item: " + id);
      listeners.forEach((cb: any) => {
        cb[0].call(cb[1], event);
      });
      if (event.event === "destroyListItem") {
        this.unregister(id);
      }
    } else {
      // console.log("No listeners for item: " + id);
    }
  }

  listen(id: ListId, listener: Function, listenerThisArg?: object) {
    // console.log("Listening for " + id);
    if (!this._itemListeners[id]) {
      this._itemListeners[id] = [];
    }
    this._itemListeners[id].push([listener, listenerThisArg]);
  }

  pushListItem(
    id: ListId,
    type: string,
    value: any,
    cb?: Function,
    cbThisArg?: object
  ) {
    this.request(
      {
        command: "pushListItem",
        list_id: id,
        type: type,
        value: JSON.stringify(value),
      },
      cb,
      cbThisArg
    );
  }

  destroyListItem(id: ListId, cb?: Function, cbThisArg?: object) {
    this.request(
      {
        command: "destroyListItem",
        item_id: id,
      },
      cb,
      cbThisArg
    );
  }

  editListItem(id: ListId, value: any, cb?: Function, cbThisArg?: object) {
    this.request(
      {
        command: "editItem",
        item_id: id,
        value: JSON.stringify(value),
      },
      cb,
      cbThisArg
    );
  }

  submit(action: any) {
    action.setListener(this.process, this);
    this._actions.push(action);
    this.process();
  }

  process() {
    console.log("processing actiosn");
    while (this._firedActions < this._actions.length) {
      try {
        const action = this._actions[this._firedActions++];
        if (!action.advance()) {
          --this._firedActions;
          this.scheduleUpdate();
          return;
        }
      } catch (ex) {
        console.log(ex);
      }
    }
    this.scheduleUpdate();
  }

  prepopulate(cb: Function, cbThisArg?: object) {
    if (!cb) {
      throw new Error("Refusing to fire without a non-null listener");
    }
    this.request({ command: "prepopulate" }, cb, cbThisArg);
  }

  close() {}

  request(reqBody: any, cb?: Function, cbThisArg?: object) {
    if (!this.roomId()) {
      throw new Error("Room must have a room ID");
    }
    if (!this.sessionId()) {
      throw new Error("Room must have a session ID");
    }
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/@" + this.roomId(), true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Accept", "application/json");
    let completed = false;
    xhr.onerror = (e: any) => {
      if (cb && !completed) {
        completed = true;
        cb.call(cbThisArg, e);
      } else if (!completed) {
        completed = true;
        console.log(e.error);
      } else {
        console.log("Request was already completed");
        console.log(e.error);
      }
    };
    xhr.onreadystatechange = function () {
      if (xhr.readyState !== XMLHttpRequest.DONE) {
        return;
      }
      try {
        const resp = JSON.parse(xhr.responseText);
        if (xhr.status === 200) {
          // Success.
          if (cb && !completed) {
            completed = true;
            cb.call(cbThisArg, null, resp);
          } else if (completed) {
            console.log("Request was already completed");
            console.log(resp);
          }
        } else {
          if (cb && !completed) {
            completed = true;
            cb.call(cbThisArg, resp);
          } else if (!completed) {
            completed = true;
            console.log(resp);
          } else {
            console.log("Request was already completed");
            console.log(resp);
          }
        }
      } catch (ex) {
        if (cb && !completed) {
          cb.call(cbThisArg, ex);
        } else if (!completed) {
          completed = true;
          console.log(ex);
        } else {
          console.log("Request was already completed");
          console.log(ex);
        }
      }
    };
    reqBody.guid = this.sessionId();
    xhr.send(JSON.stringify(reqBody));
  }
}
