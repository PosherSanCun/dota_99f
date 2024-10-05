import { PlayerBaseComp } from './_player_base';

//类=>对象(组件=系统)

export class LoopMonsters extends PlayerBaseComp {
    //属性
    point = Vector(0, 0, 128); //中心点
    timer: string | null = null;
    my_Unitlength = 5;
    n = 0;
    my_temptext;
    playerid: PlayerID = 0;
    my_healLevel = 1;
    my_npctextData = [];
    MY_npctext;

    //构造函数,当这个类被生成对象时,执行一次构造函数
    _Init() {
        //监听英雄升级
        ListenToGameEvent(
            'npc_spawned',
            event => {
                const hero = EntIndexToHScript(event.entindex) as CDOTA_BaseNPC;
                if (hero.IsHero()) {
                    hero.HeroLevelUp(true);
                    hero.HeroLevelUp(true);
                    hero.HeroLevelUp(true);
                    hero.HeroLevelUp(true);
                }
            },
            null
        );
        //监听游戏开始,执行服务器加载
        ListenToGameEvent(
            'game_rules_state_change',
            () => {
                if (GameRules.State_Get() == GameState.INIT) {
                    print(
                        '[' +
                            GetSystemDate() +
                            ' ' +
                            GetSystemTime() +
                            ']' +
                            ' 游戏初始化,但是这个时候我们只能做一些module设置相关的事情★ListenToGameEvent★'
                    );
                }
                if (GameRules.State_Get() == GameState.WAIT_FOR_PLAYERS_TO_LOAD) {
                    print('[' + GetSystemDate() + ' ' + GetSystemTime() + ']' + ' 等待玩家全部载入状态★ListenToGameEvent★');
                    // player id
                }
                if (GameRules.State_Get() == GameState.CUSTOM_GAME_SETUP) {
                    print('[' + GetSystemDate() + ' ' + GetSystemTime() + ']' + ' 2.4-2.0 自定义游戏开始!!!★ListenToGameEvent★');
                    //
                    //
                    // 时钟:每1秒执行一次
                    this.timer = Timers.CreateTimer(1.0, () => {
                        // 时钟内:前台打印信息;
                        this.my_temptext = '地图:[' + GetMapName() + '] ' + GetSystemDate() + ' ' + GetSystemTime() + ' 玩家:' + this.playerid + ' '; //地图 日期 时间
                        this.my_sendnever(this.my_temptext);

                        const player = PlayerResource.GetPlayer(this.playerid); // 获取玩家;
                        const hero = player && player.GetAssignedHero(); // 获取英雄;
                        //-- 获取英雄的名字、等级、当前血量和魔法值
                        const heroName = hero.GetUnitName();
                        const healLevel = hero.GetLevel();
                        this.my_healLevel = healLevel;
                        const health = hero.GetHealth();
                        const maxHealth = hero.GetMaxHealth();
                        const mana = hero.GetMana();
                        const maxMana = hero.GetMaxMana();
                        this.my_sendnever(
                            this.my_temptext +
                                string.format(
                                    '英雄: %s,等级:%.2f, 血量: %.2f/%.2f, 魔法: %.2f/%.2f',
                                    heroName,
                                    healLevel,
                                    health,
                                    maxHealth,
                                    mana,
                                    maxMana
                                )
                        );
                        //PlayerResource.ModifyGold(this.playerid, 30, true, 0);// 给玩家添加金币
                        // 判断场景是否需要刷怪
                        if (this.IsNeedSpawn()) {
                            this.n = this.n + 1; // 刷怪次数
                            this.my_sendnever(this.my_temptext + ' 刷怪次数:' + this.n + ' | '); //输出刷怪次数
                            // this.Spawn(); // 刷怪
                        }
                        return 1;
                        // 时钟:每1秒执行一次
                    });
                    //
                }
            },
            this
        );

        // print('2.4-1.0  自定义模块-准备创建单位!');
        // if (_G['unit']) {
        //     print('2.4-1.0.1 自定义模块-存在就移除单位.');
        //     _G['unit'].RemoveSelf();
        // } else {
        //     print('2.4-1.0.2 自定义模块-不存在就创建!');
        //     //_G['unit'] = CreateUnitByName('npc_dota_neutral_fel_beast', Vector(800 + i, 100 + i, 120), true, null, null, DotaTeam.BADGUYS);
        // }

        return () => {
            Timers.RemoveTimer(this.timer);
        };
    }

    // 判定场景是否需要刷怪;
    IsNeedSpawn(): boolean {
        const p = this.point;
        //选取中心点1200范围所有怪物
        const units: CDOTA_BaseNPC[] = FindUnitsInRadius(
            this.GetPlayer().GetTeamNumber(),
            p,
            null,
            1200,
            UnitTargetTeam.ENEMY,
            UnitTargetType.HERO + UnitTargetType.BASIC + UnitTargetType.BUILDING,
            0,
            0,
            false
        );
        if (units.length < this.my_Unitlength) {
            //循环一次刷多个怪;
            for (let i = 0; i < this.my_Unitlength - units.length; i++) {
                this.Spawn(); // 刷怪
            }
            return true;
        }
        return false;
    }

    // 刷怪与设置属性值;
    Spawn(): void {
        const p = this.point;

        const my_npctextData = [
            'npc_dota_neutral_fel_beast',
            'npc_dota_neutral_ghost',
            'npc_dota_neutral_forest_troll_berserker',
            'npc_dota_neutral_forest_troll_high_priest',
            'npc_dota_neutral_harpy_scout',
            'npc_dota_neutral_harpy_storm',
            'npc_dota_neutral_kobold',
            'npc_dota_neutral_kobold_tunneler',
            'npc_dota_neutral_kobold_taskmaster',
            'npc_dota_neutral_giant_wolf',
            'npc_dota_neutral_alpha_wolf',
            'npc_dota_neutral_mud_golem',
            'npc_dota_neutral_ogre_mauler',
            'npc_dota_neutral_ogre_magi',
            'npc_dota_neutral_centaur_outrunner',
            'npc_dota_neutral_centaur_khan',
            'npc_dota_neutral_dark_troll',
            'npc_dota_neutral_dark_troll_warlord',
            'npc_dota_neutral_polar_furbolg_champion',
            'npc_dota_neutral_polar_furbolg_ursa_warrior',
            'npc_dota_neutral_satyr_trickster',
            'npc_dota_neutral_satyr_soulstealer',
            'npc_dota_neutral_satyr_hellcaller',
            'npc_dota_neutral_wildkin',
            'npc_dota_neutral_enraged_wildkin',
            'npc_dota_neutral_black_drake',
            'npc_dota_neutral_rock_golem',
            'npc_dota_neutral_small_thunder_lizard',
            'npc_dota_neutral_granite_golem',
            'npc_dota_neutral_big_thunder_lizard',
            'npc_dota_neutral_black_dragon',
            'npc_dota_roshan',
        ];
        print(GetSystemTime() + ' 当前等级:' + this.my_healLevel + ' 当前怪物:' + this.MY_npctext + ' 刷怪数组:' + my_npctextData.length);
        // 根据英雄等级创建不同怪物单位;
        for (let i = 0; i < my_npctextData.length; i++) {
            if (this.my_healLevel == i + 1) {
                this.MY_npctext = my_npctextData[i];
            }
        }
        const unit = CreateUnitByName(this.MY_npctext, p.__add(RandomVector(100)), true, null, null, DotaTeam.BADGUYS);
        // 设置血量和最大血量
        //unit.SetHealth(2);
        //unit.SetMaxHealth(500);
        // 设置攻击力与最大攻击力
        unit.SetBaseDamageMin(1);
        unit.SetBaseDamageMax(5);

        //unit.SetBaseAttackTime(1); //设置攻击间隔
        //unit.SetBaseMoveSpeed(333); //设置移动速度
        //unit.SetDeathXP(2000); // 设置死亡经验奖励
        //unit.SetMinimumGoldBounty(33); // 设置金钱奖励最低
        //unit.SetMaximumGoldBounty(33); // 设置金钱奖励最高
    }

    // 发送消息给never
    my_sendnever(texts) {
        const player = PlayerResource.GetPlayer(this.playerid as PlayerID);
        CustomGameEventManager.Send_ServerToPlayer(player, 'test_print_message', {
            text: texts,
        } as never);
    }
}

//判断游戏是否 开启检测英雄是否 存在
