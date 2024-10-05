import 'utils/index';
import { ActivateModules } from './modules';
import Precache from './utils/precache';

Object.assign(getfenv(), {
    Activate: () => {
        print(GetSystemDate() + ' ' + GetSystemTime() + ' ' + '1.0 游戏开始!!!');
        ActivateModules();
    },
    Precache: Precache,
});
