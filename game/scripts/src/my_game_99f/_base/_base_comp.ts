export class BaseComp {
    remove: () => void;
    constructor() {
        this.remove = this._Init();
    }

    //所有玩家组建初始化方法,仅用来给继承者重载
    _Init() {
        return () => {};
    }

    //移除玩家组件
    Remove() {
        this.remove && this.remove();
    }
}

export class PlayerBaseComp {
    playerId: PlayerID;
    remove: () => void;
    constructor(playerId: PlayerID) {
        this.playerId = playerId;
        this.remove = this._Init();
    }

    //所有玩家组建初始化方法,仅用来给继承者重载
    _Init() {
        return () => {};
    }

    //移除玩家组件
    Remove() {
        this.remove && this.remove();
    }

    //获取这个组建所属的玩家
    GetPlayer() {
        return PlayerResource.GetPlayer(this.playerId as PlayerID);
    }

    //获取这个组建所属的英雄
    GetHero() {
        return this.GetPlayer().GetAssignedHero();
    }
}
