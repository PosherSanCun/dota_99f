import { Debug } from './Debug';
import { GameConfig } from './GameConfig';
import { XNetTable } from './xnet-table';
import { Game_Mode } from '../my_game_99f/game_mode';
declare global {
    interface CDOTAGameRules {
        // 声明所有的GameRules模块，这个主要是为了方便其他地方的引用（保证单例模式）
        XNetTable: XNetTable;
    }
    var MyGame: Game_Mode;
}

/**
 * 这个方法会在game_mode实体生成之后调用，且仅调用一次
 * 因此在这里作为单例模式使用
 **/
export function ActivateModules() {
    print('[' + GetSystemDate() + ' ' + GetSystemTime() + '] ' + '2.0 重载游戏！');
    if (GameRules.XNetTable == null) {
        print('[' + GetSystemDate() + ' ' + GetSystemTime() + '] ' + '2.1 初始化所有的GameRules模块!XNetTable()');
        GameRules.XNetTable = new XNetTable();
        print('[' + GetSystemDate() + ' ' + GetSystemTime() + '] ' + '2.2 如果某个模块不需要在其他地方使用，那么直接在这里使用即可!GameConfig()');
        new GameConfig();
        print('[' + GetSystemDate() + ' ' + GetSystemTime() + '] ' + '2.3 初始化测试模块xD!Debug()');
        new Debug();
    }
    print('[' + GetSystemDate() + ' ' + GetSystemTime() + '] ' + '2.4 加载自定义的模块,生成一些系统!LoopMonsters(0)');
    //生成一些系统
    MyGame = new Game_Mode();
}
