const ApplicationPolicy = require("./application");

module.exports = class TopicPolicy extends ApplicationPolicy {

 // #2
  new() {
    return this._isUser();
  }

  create() {
    return this.new();
  }

 // #3
  edit() {
    return this._isUser();
  }

  update() {
    return this.edit();
  }

  destroy() {
    return this.update();
  }
}
