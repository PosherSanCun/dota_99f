import { BaseAbility, registerAbility } from '../utils/dota_ts_adapter';

@registerAbility()
class ability01 extends BaseAbility {
    private pfx_pre2: ParticleID;
    private cd = 0;
    private stunned = false;
    public curpos;
    public pos;
    public fow;
    public caster;

    Precache(context: CScriptPrecacheContext): void {
        PrecacheResource('particle', 'particles/econ/items/invoker/invoker_ti6/invoker_deafening_blast_wave_ti6.vpcf', context);
        PrecacheResource('particle', 'particles/faceless_void_arcana_time_walk_preimage_combined_cut2.vpcf', context);
        PrecacheResource('particle', 'particles/dynamic_water_ring_96.vpcf', context);
        PrecacheResource('particle', 'particles/razor_arcana_idle_rare_lightning_sparks.vpcf', context);
    }

    OnSpellStart() {
        const caster = this.GetCaster();
        //判定单位是是否拥有MODIFIER_STATE_TETHERED状态
        if (caster.HasModifier('modifier_tethered')) {
            return;
        }

        caster.EmitSound('Greevil.ColdSnap.Cast');
        caster.AddNewModifier(this.GetCaster(), this, 'modifier_immune', { duration: 0.2 }); //0.2秒无敌帧
        this.caster = caster;
        const distanceMax = 800; //距离上限
        let targetLocation = this.GetCursorPosition();
        this.curpos = targetLocation;
        this.pos = this.GetCaster().GetAbsOrigin();
        const forwardVector = ((targetLocation - caster.GetAbsOrigin()) as Vector).Normalized();
        this.fow = forwardVector;
        if (((targetLocation - caster.GetAbsOrigin()) as Vector).Length2D() > distanceMax) {
            targetLocation = (caster.GetAbsOrigin() + forwardVector * distanceMax) as Vector;
        }

        this.PlayEffect1(targetLocation, caster.GetAbsOrigin());

        // 冲锋速度和每次更新的时间间隔
        const chargeSpeed = 3800; // units per second
        const interval = 0.02; // 更新间隔 (秒)

        const initialPosition = caster.GetAbsOrigin();
        const distance = ((targetLocation - initialPosition) as Vector).Length2D();
        const duration = distance / chargeSpeed;
        //判定点是否可到达
        const dis = GridNav.FindPathLength(caster.GetAbsOrigin(), targetLocation);
        const dis2 = ((targetLocation - caster.GetAbsOrigin()) as Vector).Length2D();
        if (!caster.HasModifier('modifier_charge_state2') && dis != -1 && (dis / dis2 > 1.15 || dis - dis2 > 80)) {
            this.onEnd(true, targetLocation);
        } else {
            let elapsedTime = 0;
            const p = caster.GetAbsOrigin();
            const p1 = { x: p.x, y: p.y }; //起始点
            const p2 = { x: targetLocation.x, y: targetLocation.y }; //终点
            const tween = Tween.New(tonumber(duration) + 0.01, p1, p2, 'outQuad');
            let old_p = caster.GetAbsOrigin();
            if (caster.GetCustomValue('野蛮冲撞') > 0) {
                this.card_114_crash(caster.GetAbsOrigin(), targetLocation);
            }
            // 创建一个计时器，逐步移动施法者的位置以模拟冲锋效果
            Timers.CreateTimer(interval, () => {
                //判定单位是否被沉默
                if (caster.HasModifier('modifier_imba_mars_arena_of_blood_wall_aura')) {
                    this.onEnd(true);
                    return null;
                }
                elapsedTime += interval;
                tween.update(interval);
                let new_position = Vector(p1.x, p1.y, caster.GetAbsOrigin().z);
                const add = new_position - old_p;
                old_p = Vector(p1.x, p1.y, caster.GetAbsOrigin().z);
                new_position = (caster.GetAbsOrigin() + add) as Vector;
                const position = (caster.GetAbsOrigin() + forwardVector * 64) as Vector;
                const position2 = (caster.GetAbsOrigin() + RotatePosition(Vector(0, 0, 0), QAngle(0, 10, 0), forwardVector) * 32) as Vector;
                const position3 = (caster.GetAbsOrigin() + RotatePosition(Vector(0, 0, 0), QAngle(0, -10, 0), forwardVector) * 32) as Vector;
                if (
                    !GridNav.IsPassable(new_position) ||
                    !GridNav.IsPassable(position) ||
                    !GridNav.IsPassable(position2) ||
                    !GridNav.IsPassable(position3)
                ) {
                    CreateParticleToPoint('particles/razor_arcana_idle_rare_lightning_sparks.vpcf', 0, position);
                    new_position = FindNearestWalkablePoint(caster.GetAbsOrigin(), 64);
                }
                caster.SetOrigin(new_position);
                this.onUP();
                // 检查是否到达目标位置
                if (elapsedTime >= duration || caster.GetBaseMoveSpeed() < 2) {
                    //判定最终落点和初始点是否可同行
                    const dis = GridNav.FindPathLength(caster.GetAbsOrigin(), initialPosition);
                    if (dis == -1) {
                        FindClearSpaceForUnit(caster, this.GetOrigin(), true);
                        const dis2 = GridNav.FindPathLength(caster.GetAbsOrigin(), initialPosition);
                        if (dis2 == -1) {
                            caster.SetOrigin(initialPosition);
                        }
                    }
                    this.onEnd(true);
                    return null;
                }
                // 以每秒 30 帧的速度移动
                return interval;
            });
        }
    }

    //野蛮冲撞效果
    card_114_crash(dis: Vector, dis2: Vector) {
        const caster = this.GetCaster();
        const value = caster.FindModifierByName('modifiers_hero_hudun').GetStackCount();
        const enemies = FindUnitsInLine(
            caster.GetTeamNumber(),
            dis,
            dis2,
            undefined,
            300,
            UnitTargetTeam.ENEMY,
            UnitTargetType.HERO + UnitTargetType.BASIC + UnitTargetType.BUILDING,
            UnitTargetFlags.MAGIC_IMMUNE_ENEMIES
        );
        if (GameRules.GetGameTime() > this.cd) {
            this.stunned = true;
        } else {
            this.stunned = false;
        }
        enemies.forEach(enemy => {
            CustomApplyDamage({
                victim: enemy,
                attacker: caster,
                damage: value * 3,
                damage_type: DamageTypes.MAGICAL,
                ability: this,
            });
            if (this.stunned) {
                enemy.AddNewModifier(enemy, null, 'modifier_stunned', { duration: 1 });
            }
        });
        this.cd = GameRules.GetGameTime() + 5;
    }

    PlayEffect1(tar, caster_pos) {
        const pfx_name = 'particles/faceless_void_arcana_time_walk_preimage_combined_cut2.vpcf';
        const pfx = ParticleManager.CreateParticle(pfx_name, ParticleAttachment.CUSTOMORIGIN, null);
        ParticleManager.SetParticleControl(pfx, 0, caster_pos);
        ParticleManager.SetParticleControl(pfx, 1, tar);
        this.pfx_pre2 = pfx;
    }

    //运动帧回调
    onUP() {
        // 冲锋伤害
        // let loc = this.GetCaster().GetAbsOrigin();
        // let enemies = FindUnitsInRadius(
        //     this.GetCaster().GetTeamNumber(),
        //     loc,
        //     null,
        //     100,
        //     UnitTargetTeam.ENEMY,
        //     UnitTargetType.HERO + UnitTargetType.BASIC + UnitTargetType.BUILDING,
        //     UnitTargetFlags.NOT_MAGIC_IMMUNE_ALLIES,
        //     0,
        //     false
        // );
        // //伤害处理
        // enemies.forEach(item => {
        //     const damageOption: ApplyDamageOptions = {
        //         victim: item,
        //         attacker: this.GetCaster(),
        //         damage: this.GetCaster().GetAttackDamage(),
        //         damage_type: DamageTypes.PHYSICAL,
        //         ability: this,
        //     };
        //     // 目标应用伤害
        //     ApplyDamage(damageOption);
        // });
    }

    onEnd(flag: boolean, targetLocation?) {
        // 重置落点
        // const p = FindNearestWalkablePoint(this.GetCaster().GetAbsOrigin(), 125);
        const p = this.GetCaster().GetAbsOrigin();
        FindClearSpaceForUnit(this.GetCaster(), targetLocation || p, true);
        //清除特效
        ParticleManager.DestroyParticle(this.pfx_pre2, false);
    }
}
