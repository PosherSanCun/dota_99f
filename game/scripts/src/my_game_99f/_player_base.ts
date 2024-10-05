export class PlayerBaseComp {
    playerid: PlayerID;
    remove;
    constructor(playerid: PlayerID) {
        this.playerid = playerid;
        this.remove = this._Init();
    }

    //所有玩家组建初始化方法,仅用来给继承者重载
    _Init() {
        return () => {};
    }

    //获取这个组建所属的玩家
    GetPlayer() {
        return PlayerResource.GetPlayer(this.playerid as PlayerID);
    }

    //获取这个组建所属的英雄
    GetHero() {
        return this.GetPlayer().GetAssignedHero();
    }

    //移除玩家组件
    Remove() {
        this.remove();
    }
}
