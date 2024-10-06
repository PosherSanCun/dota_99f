/**
 * 测试命令模块
 */
function changeCameraDistance(dis: number, time: number) {
    let i = 0;
    Timers.CreateTimer(0.01, () => {
        const game: CDOTABaseGameMode = GameRules.GetGameModeEntity();
        const distance = game.GetCameraDistanceOverride();
        game.SetCameraDistanceOverride(distance + (dis * 0.01) / time); // 设置镜头距离
        i = i + 0.01;
        if (i > time) {
            return;
        }
        return 0.01;
    });
}
export const t = {
    ['+']: function () {
        changeCameraDistance(300, 0.5);
    },
    //降低镜头
    ['-']: function () {
        changeCameraDistance(-300, 0.5);
    },
    ['-r']: function () {
        print('-r 命令restart重启游戏!');
        SendToConsole('clear'); // 清空控制台
        SendToConsole('restart'); // 重启游戏
    },
    ['-s']: function () {
        print('-s 命令script_reload!');
        SendToConsole('script_reload');
    },
    ['-t']: function (playerid) {
        print('玩家:' + playerid + ' 输入了-t 英雄到指定位置并初始化设定的相关参数.');

        const player = PlayerResource.GetPlayer(playerid); // 获取玩家;
        const hHero = player && player.GetAssignedHero(); // 获取英雄;
        //print('-t:获取player + hHero :' + player + ' | ' + hHero);

        //print(hHero.GetCurrentVisionRange()); // 获取视野范围
        //print(hHero.GetBaseDayTimeVisionRange()); // 获取视野范围白天
        //print(hHero.GetNightTimeVisionRange()); // 获取视野范围夜间
        hHero.SetDayTimeVisionRange(1500); // 设置视野范围
        hHero.SetNightTimeVisionRange(1500); // 设置视野范围

        const heroPosition = hHero.GetAbsOrigin();
        print('-t:获取英雄当前位置信息 :' + heroPosition);
        hHero.SetOrigin(Vector(-824, -117, 256)); // 设置英雄的位置;

        //-- 获取英雄的名字、当前血量和魔法值
        const hHName = hHero.GetUnitName(); // 获取英雄的名字;
        const hHLevel = hHero.GetLevel(); // 获取英雄的等级;
        const hHHealth = hHero.GetHealth(); // 获取英雄的血量;
        const hHmaxHealth = hHero.GetMaxHealth(); // 获取英雄的最大血量;
        const hHHealthRegen = hHero.GetBaseHealthRegen(); // 获取英雄的生命回复;
        const hHmana = hHero.GetMana(); // 获取英雄的魔法值;
        const hHmaxMana = hHero.GetMaxMana(); // 获取英雄的最大魔法值;
        const hHManaRegen = hHero.GetBaseManaRegen(); // 获取英雄的魔法回复;
        print(
            '-t:' +
                string.format(
                    '英雄: %s,等级:%.2f, 血量: %.2f/%.2f,生命恢复:%.2f ,魔法: %.2f/%.2f,魔法恢复:%.2f',
                    hHName,
                    hHLevel,
                    hHHealth,
                    hHmaxHealth,
                    hHHealthRegen,
                    hHmana,
                    hHmaxMana,
                    hHManaRegen
                )
        );
        const hHBaseMaxHealth = hHero.GetBaseMaxHealth(); // 获取最大生命值
        if (hHBaseMaxHealth < 500) hHero.SetMaxHealth(hHBaseMaxHealth + 500);

        if (hHmaxHealth < hHHealthRegen) hHero.SetHealth(hHmaxHealth); // 设置血量满
        if (hHmaxMana < hHmana) hHero.SetMana(hHmaxMana); // 设置魔法值满
        if (hHHealthRegen < 20) hHero.SetBaseHealthRegen(hHHealthRegen + 20); // 设置生命回复
        if (hHManaRegen < 10) hHero.SetBaseManaRegen(hHManaRegen + 10); // 设置魔法回复
        const hHDamageMin = hHero.GetBaseDamageMin(); // 获取攻击力
        const hHDamageMax = hHero.GetBaseDamageMax(); // 获取最大攻击力
        if (hHDamageMin < 100) hHero.SetBaseDamageMin(hHDamageMin + 100); // 设置攻击力
        if (hHDamageMax < 100) hHero.SetBaseDamageMax(hHDamageMax + 100); // 设置最大攻击力

        //hHero.SetAttackSpeed(hHero.GetAttackSpeed() * 100); // 设置攻击速度

        //print(hHero.GetAttackCapability()); // 获取攻击类型

        //-- 获取/设置 护甲
        // const armor = hHero.GetPhysicalArmorValue()
        // hHero.ChangeArmorValue(armor + 2)  //-- 增加2点护甲

        //-- 获取/设置 移动速度
        const moveSpeed = hHero.GetBaseMoveSpeed();
        hHero.SetBaseMoveSpeed(moveSpeed + 50); //-- 增加50点移动速度

        //-- 获取/设置 攻击速度

        // const attackSpeed = hHero.GetAttackSpeed();
        // hHero.SetAttackSpeed(attackSpeed + 50)  //-- 增加50点攻击速度

        //-- 获取/设置 经验值

        //-- 获取/设置 等级
        //hHero.SetLevel(hLevel + 1, false)  //-- 提升一级，不触发等级提升事件

        print(hHero.GetBaseAttackRange()); // 获取攻击范围(修改器不列入计算)。
        print(hHero.GetBaseAttackTime()); // 获取攻击间隔
        print(hHero.GetBaseDamageMax()); // 获取最大攻击力
        print(hHero.GetBaseDamageMin()); // 获取最小攻击力
        print(hHero.GetBaseDayTimeVisionRange()); // 获取视野范围(修改器不列入计算)。
        print(hHero.GetBaseHealthRegen()); // 获取生命回复
        print(hHero.GetBaseMagicalResistanceValue()); // 获取魔法抗性
        print(hHero.GetBaseMaxHealth()); // 获取最大生命值
        print(hHero.GetBaseMoveSpeed()); // 获取移动速度
        print(hHero.GetBaseNightTimeVisionRange()); // 获取视野范围(修改器不列入计算)。
    },
    ['-t2']: function (playerid) {
        print('-t2:玩家' + playerid + ' 输入了-t2,如果单位存在就移除单位.');
        if (_G['unit']) _G['unit'].RemoveSelf();
        _G['unit'] = CreateUnitByName('npc_dota_hero_undying', Vector(100, 100, 128), true, null, null, DotaTeam.BADGUYS);
    },

    ['-ms']: function () {
        print('-ms 命令text!');
        const player = PlayerResource.GetPlayer(0 as PlayerID);
        CustomGameEventManager.Send_ServerToPlayer(player, 'test_print_message', {
            text: GetMapName() + ' ' + GetSystemDate() + ' ' + GetSystemTime(),
        } as never);
    },
    ['-t3']: function (playerid) {
        print('-t3: 命令!');
        if (_G['unit']) _G['unit'].RemoveSelf();
        _G['unit'] = CreateUnitByName('npc_dota_neutral_shop', Vector(200, 100, 128), false, null, null, DotaTeam.NEUTRALS);
    },
};
