import { BaseComp, PlayerBaseComp } from './_base/_base_comp';
import { MonstersRoom } from './monsters_room';

//玩家局内资源管理
//玩家状态管理
//玩家存档管理

//玩家类,具体某个玩家得组件
// const mon = new LoopMonsters(id);
class Player extends PlayerBaseComp {
    monsters_room: MonstersRoom;
    _Init(): () => void {
        this.monsters_room = new MonstersRoom(this.playerId);
        //监听英雄出生,监听英雄复活
        const id = ListenToGameEvent(
            'npc_spawned',
            event => {
                print('单位诞生');
                const npc = EntIndexToHScript(event.entindex) as CDOTA_BaseNPC;
                if (!npc.IsHero()) return;
                // if (this.GetHero() != npc) return;
                this.OnHeroSpawn(npc);
            },
            null
        );

        return () => {
            this.monsters_room.Remove();
            StopListeningToGameEvent(id);
        };
    }

    //英雄出生/复活
    OnHeroSpawn(hero: CDOTA_BaseNPC_Hero) {
        // const p = this.monsters_room.GetPoint();
        // print(p);
        // Timers.CreateTimer(0.1, () => {
        //     hero.SetOrigin(p);
        // });
        //设置英雄所有技能等级为1级
        for (let i = 0; i < hero.GetAbilityCount(); i++) {
            const ability = hero.GetAbilityByIndex(i);
            if (!ability) continue;
            ability.SetLevel(1);
        }
    }
}

//玩家注册接口
export class PlayerRegister extends BaseComp {
    player_comp: Player[];
    _Init() {
        //监听玩家连接到游戏
        const id = ListenToGameEvent(
            'player_connect_full',
            event => {
                print('玩家链接到游戏!');
                print(event.PlayerID);
                const playerComp = new Player(event.PlayerID);
                // this.player_comp.push(playerComp);
            },
            null
        );

        return () => {
            StopListeningToGameEvent(id);
            if (this.player_comp) {
                for (let i = 0; i < this.player_comp.length; i++) {
                    this.player_comp[i].Remove();
                }
            }
        };
    }
}
