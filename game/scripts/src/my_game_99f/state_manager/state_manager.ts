import { BaseComp } from '../_base/_base_comp';
import { PlayerRegister } from '../player';
//进入游戏阶段,主菜单 选难度 选角色

enum GameState {
    INIT = 0, //初始化
    MAIN_MENU = 1, //主菜单
    PLAYING = 2, //游戏中
    GAME_END = 3, //结算
}

//状态管理器
export class StateManager extends BaseComp {
    state: GameState = GameState.INIT;
    _Init(): () => void {
        const player_comp = new PlayerRegister();
        print('状态机启动...');
        return () => {
            player_comp.Remove();
        };
    }

    GetState() {
        return this.state;
    }
}
