import { BaseComp, PlayerBaseComp } from './_base/_base_comp';
import * as monster_list from '../json/monster.json';
//类=>对象(组件=系统)

const player_point = {
    [0]: Vector(-1200, 1200, 128),
    [1]: Vector(1200, 1200, 128),
    [2]: Vector(-1200, -1200, 128),
    [3]: Vector(1200, -1200, 128),
};

export class MonstersRoom extends PlayerBaseComp {
    //属性
    point; //中心点
    timer: string | null = null;
    my_Unitlength = 5;
    n = 0;
    my_temptext;
    room_lv = 1;
    my_npctextData = [];
    MY_npctext;

    //构造函数,当这个类被生成对象时,执行一次构造函数
    _Init() {
        this.timer = Timers.CreateTimer(1.0, () => {
            // 时钟内:前台打印信息;
            this.my_temptext = '地图:[' + GetMapName() + '] ' + GetSystemDate() + ' ' + GetSystemTime() + ' 玩家:' + this.playerId + ' '; //地图 日期 时间
            this.my_sendnever(this.my_temptext);

            const player = PlayerResource.GetPlayer(this.playerId); // 获取玩家;
            const hero = player && player.GetAssignedHero(); // 获取英雄;
            //-- 获取英雄的名字、等级、当前血量和魔法值
            const heroName = hero.GetUnitName();
            const healLevel = hero.GetLevel();
            this.room_lv = healLevel;
            const health = hero.GetHealth();
            const maxHealth = hero.GetMaxHealth();
            const mana = hero.GetMana();
            const maxMana = hero.GetMaxMana();
            this.my_sendnever(
                this.my_temptext +
                    string.format('英雄: %s,等级:%.2f, 血量: %.2f/%.2f, 魔法: %.2f/%.2f', heroName, healLevel, health, maxHealth, mana, maxMana)
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

        return () => {
            Timers.RemoveTimer(this.timer);
        };
    }

    //获取玩家的出生点
    GetPoint() {
        if (this.point) return this.point;
        this.point = player_point[this.playerId];
        return player_point[this.playerId];
    }

    // 判定场景是否需要刷怪;
    IsNeedSpawn(): boolean {
        const p = this.GetPoint();
        //选取中心点1200范围所有怪物
        print(this.GetPlayer().GetTeamNumber());
        print(p);
        const units: CDOTA_BaseNPC[] = FindUnitsInRadius(
            this.GetPlayer().GetTeamNumber(),
            this.GetPoint(),
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
        print(GetSystemTime() + ' 当前等级:' + this.room_lv + ' 当前怪物:' + this.MY_npctext + ' 刷怪数组:' + my_npctextData.length);
        // 根据英雄等级创建不同怪物单位;
        for (let i = 0; i < my_npctextData.length; i++) {
            if (this.room_lv == i + 1) {
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
        const player = PlayerResource.GetPlayer(this.playerId as PlayerID);
        CustomGameEventManager.Send_ServerToPlayer(player, 'test_print_message', {
            text: texts,
        } as never);
    }
}

//判断游戏是否 开启检测英雄是否 存在
