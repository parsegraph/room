type ListId = number | string;
type Username = string;

abstract class ListItem {
  _id: ListId;
  _owner: Username;

  constructor(id: ListId, owner: Username) {
    this._id = id;
    this._owner = owner;
  }

  owner() {
    return this._owner;
  }

  id() {
    return this._id;
  }

  abstract type(): string;

  abstract value(): any;

  abstract items(): ListItem[];

  toJSON() {
    return {
      id: this.id(),
      type: this.type(),
      value: JSON.stringify(this.value()),
      username: this.owner(),
      items: this.items().map((item) => item.toJSON()),
    };
  }
}

export default ListItem;
export { ListId, Username };
