const ApplicationPolicy = require("./application");

module.exports = class TopicPolicy extends ApplicationPolicy {

 // #2


  _isCollab(){
    if(this.record.collaborators && this.record.collaborators.length !== 0){
      let _ids = []
      this.record.collaborators.forEach((collab) =>{
        _ids.push(collab.userId);
      });
      return _ids.includes(this.user.id);
    }
    return true;
  }

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

  updatePrivacy(){
    return this._isAdmin() || this._isOwner();
  }

  private(){
    return this._isUser() && (this._isAdmin() || this._isPremium());
  }

  privateRecord(){
    return this._isUser() && (this._isAdmin() || this._isOwner() || this._isCollab());
  }
}
