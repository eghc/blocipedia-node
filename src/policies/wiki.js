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
    if(this.record.private){
      return this.privateRecord();
    }else{
      return this._isUser()
    }

  }

  update() {
    return this.edit();
  }

  destroy() {
    return this.update();
  }

  private(){
    return this._isUser() && (this._isAdmin() || this._isPremium());
  }

  privateRecord(){
    return this._isUser() && (this._isAdmin() || this._isOwner());
  }
}
