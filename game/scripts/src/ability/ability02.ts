import { BaseAbility, registerAbility, registerModifier, BaseModifier } from '../utils/dota_ts_adapter';

@registerAbility()
class ability02 extends BaseAbility {
    // private pfx_pre2: ParticleID;
    private n: number;
    Precache(context: CScriptPrecacheContext): void {}

    Spawn(): void {
        if (!IsServer()) return;
        this.n = 0;
    }

    OnSpellStart(): void {
        this.GetCaster().EmitSound('Hero_Invoker.DeafeningBlast');
        const unit = this.GetCaster();
        unit.AddNewModifier(unit, this, 'modifier_pause_actions', { duration: 0.15 });
        //获取需要吟唱的时间
        const caster = this.GetCaster();
        caster.StartGestureWithPlaybackRate(GameActivity.DOTA_CAST_ABILITY_4, 1.5);
        const target_point = this.GetCursorPosition();
        const fow = target_point.__sub(caster.GetAbsOrigin()).Normalized();
        const targetLocation = caster.GetAbsOrigin() + fow * 1200;
        const info = {
            vSpawnOrigin: caster.GetAbsOrigin(), //设置起始位置
            vVelocity: (caster.GetForwardVector() * 1000) as Vector, // 速度
            vAcceleration: Vector(0, 0, 0), // 加速度
            fMaxSpeed: 1000, //设置最大速度
            fDistance: 1000, //设置最大距离
            fStartRadius: 250, //设置初始半径
            fEndRadius: 250, //设置结束半径
            fExpireTime: GameRules.GetGameTime() + 1, //设置最大飞行时间
            iUnitTargetTeam: UnitTargetTeam.ENEMY, //目标队伍
            iUnitTargetFlags: UnitTargetFlags.MAGIC_IMMUNE_ENEMIES, //目标类型(基本单位+英雄)
            iUnitTargetType: UnitTargetType.HERO + UnitTargetType.BASIC + UnitTargetType.BUILDING, //目标类型(基本单位+英雄)
            bIgnoreSource: true, //是否忽略来源
            bHasFrontalCone: true, //是否有锥形
            bDrawsOnMinimap: false, //是否在小地图上画线
            bVisibleToEnemies: true, //是否对敌人可见
            EffectName: 'particles/invoker_deafening_blast_ti6.vpcf', //特效
            Ability: this, //技能
            Source: caster, //来源
            bProvidesVision: false, //是否提供视野
            ExtraData: {
                // hited: hited,
            }, //额外数据
        };
        ProjectileManager.CreateLinearProjectile(info);
        ScreenShake(((caster.GetAbsOrigin() + targetLocation) / 2) as Vector, 5, 2, 1, 1300, 0, true); //屏幕抖动,参数分别为:中心点,振幅,频率,持续时间,半径,波形,是否震动摄像机
    }

    //技能开始施法前摇
    OnAbilityPhaseStart() {
        this.n = 0;
        this.GetCaster().AddNewModifier(this.GetCaster(), this, 'ability02_modifier', { duration: 0.3 });
        const unit = this.GetCaster();
        unit.SetColor(Vector(255, 0, 255), 0.2);
        Timers.CreateTimer(0.4, () => {
            unit.SetColor(Vector(255, 255, 255), 0.2);
        });
        unit.StartGestureWithPlaybackRate(GameActivity.DOTA_CAST_ABILITY_3, 1);
        return true;
    }

    //技能引导完成
    OnChannelFinish() {
        this.GetCaster().EmitSound('Hero_Invoker.DeafeningBlast');
        const unit = this.GetCaster();
        unit.AddNewModifier(unit, this, 'modifier_pause_actions', { duration: 0.15 });
        //获取需要吟唱的时间
        const caster = this.GetCaster();
        caster.StartGestureWithPlaybackRate(GameActivity.DOTA_CAST_ABILITY_4, 1.5);
        const target_point = this.GetCursorPosition();
        const fow = target_point.__sub(caster.GetAbsOrigin()).Normalized();
        const targetLocation = caster.GetAbsOrigin() + fow * 1200;

        const info = {
            vSpawnOrigin: caster.GetAbsOrigin(), //设置起始位置
            vVelocity: (caster.GetForwardVector() * 1000) as Vector, // 速度
            vAcceleration: Vector(0, 0, 0), // 加速度
            fMaxSpeed: 1000, //设置最大速度
            fDistance: 1000, //设置最大距离
            fStartRadius: 250, //设置初始半径
            fEndRadius: 250, //设置结束半径
            fExpireTime: GameRules.GetGameTime() + 1, //设置最大飞行时间
            iUnitTargetTeam: UnitTargetTeam.ENEMY, //目标队伍
            iUnitTargetFlags: UnitTargetFlags.MAGIC_IMMUNE_ENEMIES, //目标类型(基本单位+英雄)
            iUnitTargetType: UnitTargetType.HERO + UnitTargetType.BASIC + UnitTargetType.BUILDING, //目标类型(基本单位+英雄)
            bIgnoreSource: true, //是否忽略来源
            bHasFrontalCone: true, //是否有锥形
            bDrawsOnMinimap: false, //是否在小地图上画线
            bVisibleToEnemies: true, //是否对敌人可见
            EffectName: 'particles/invoker_deafening_blast_ti6.vpcf', //特效
            Ability: this, //技能
            Source: caster, //来源
            bProvidesVision: false, //是否提供视野
            ExtraData: {
                // hited: hited,
            }, //额外数据
        };
        ProjectileManager.CreateLinearProjectile(info);
        ScreenShake(((caster.GetAbsOrigin() + targetLocation) / 2) as Vector, 5, 2, 1, 1300, 0, true); //屏幕抖动,参数分别为:中心点,振幅,频率,持续时间,半径,波形,是否震动摄像机
    }

    OnProjectileHit(target: CDOTA_BaseNPC, location: Vector): boolean | void {
        if (target == undefined) return;
        const caster = this.GetCaster();
        const point = caster.GetOrigin();
        //击退单位
        if (!target.HasModifier('modifier_pause_actions')) {
            const time = 0.7 + (this.GetLevel() || 1) * 0.1;
            target.AddNewModifier(caster, this, 'modifier_stunned', { duration: time });
            target.AddNewModifier(caster, this, 'modifier_knockback', {
                duration: time,
                center_x: location.x, //击退中心点
                center_y: location.y, //击退中心点
                center_z: location.z, //击退中心点
                should_stun: true, //是否晕眩
                knockback_duration: 0.2, //击退时间
                knockback_distance: 100, //击退距离
                knockback_height: 1, //击退高度
            });
        }
        CustomApplyDamage({
            victim: target,
            attacker: caster,
            damage: (caster.GetAverageTrueAttackDamage(caster) * 3 + 50) * 1.06 ** caster.GetLevel() * (0.9 + (this.GetLevel() || 1) * 0.1),
            damage_type: DamageTypes.MAGICAL,
            ability: this,
            type: 19999,
        });
    }

    //技能开始引导
    OnChannelThink(flInterval) {
        this.n++;
        if (this.n % 2 == 0) {
            const caster = this.GetCaster();
            ScreenShake(caster.GetAbsOrigin() as Vector, 1, 1, 0.2, 1000, 0, true);
        }
        //吟唱中
        if (this.n == 30) {
            const caster = this.GetCaster();
            const pfx_name = 'particles/teleport_end_bots_counter6.vpcf';
            const pfx1 = ParticleManager.CreateParticle(pfx_name, ParticleAttachment.CENTER_FOLLOW, caster);
            ParticleManager.SetParticleControlEnt(
                pfx1,
                3,
                this.GetCaster(),
                ParticleAttachment.POINT_FOLLOW,
                'attach_hitloc',
                this.GetCaster().GetAbsOrigin(),
                true
            );
            ParticleManager.DestroyParticle(pfx1, false);
        }
    }
}

@registerModifier()
class ability02_modifier extends BaseModifier {
    OnDestroy(): void {
        if (!IsServer()) return;
        const caster = this.GetCaster();
        const pfxname = 'particles/lifestealer_immortal_backbone_rage_end_mid.vpcf';
        const pfx = ParticleManager.CreateParticle(pfxname, ParticleAttachment.CUSTOMORIGIN, caster);
        ParticleManager.SetParticleControl(pfx, 2, caster.GetAbsOrigin());
        this.AddParticle(pfx, false, false, -1, false, false);
    }
}
