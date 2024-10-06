import { StateManager } from './state_manager/state_manager';

export class Game_Mode {
    state_manager: StateManager;
    constructor() {
        //监听游戏开始,执行服务器加载
        print('游戏生成...');
        this.state_manager = new StateManager();
        ListenToGameEvent(
            'game_rules_state_change',
            () => {
                if (GameRules.State_Get() == GameState.CUSTOM_GAME_SETUP) this.Preload();
            },
            this
        );
    }

    Preload() {}

    GetState() {
        return this.state_manager.GetState();
    }
}
