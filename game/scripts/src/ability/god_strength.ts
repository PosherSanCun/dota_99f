import { BaseAbility, BaseModifier, registerAbility, registerModifier } from '../utils/dota_ts_adapter';

@registerAbility()
class god_strength extends BaseAbility {
    pfx_pre2;
    OnSpellStart(): void {
        if (!IsServer()) return;
        const caster = this.GetCaster();
        caster.EmitSound('Hero_Sven.GodsStrength');
        const pfx = ParticleManager.CreateParticle(
            'particles/units/heroes/hero_sven/sven_spell_gods_strength.vpcf',
            ParticleAttachment.ABSORIGIN_FOLLOW,
            caster
        );
        ParticleManager.ReleaseParticleIndex(pfx);
        ScreenShake(caster.GetAbsOrigin() as Vector, 1, 1, 0.2, 1000, 0, true);
        caster.AddNewModifier(caster, this, 'god_strength_modifire', { duration: 12 });
        this.GetCaster().RecoverBlood(caster.GetMaxHealth() * 0.5, this, '治疗');
        caster.AddNewModifier(this.GetCaster(), this, 'modifier_immune', { duration: 1 });
    }

    PlayEffect() {
        const pfx_name = 'particles/units/heroes/hero_life_stealer/life_stealer_rage_cast.vpcf';
        this.GetCaster().StartGestureFadeWithSequenceSettings(GameActivity.DOTA_LIFESTEALER_RAGE);
        const pfx = ParticleManager.CreateParticle(pfx_name, ParticleAttachment.CUSTOMORIGIN_FOLLOW, this.GetCaster());
        ParticleManager.SetParticleControlEnt(pfx, 0, this.GetCaster(), ParticleAttachment.POINT_FOLLOW, 'attach_hitloc', Vector(0, 0, 0), true);
        ParticleManager.SetParticleControlEnt(pfx, 1, this.GetCaster(), ParticleAttachment.POINT_FOLLOW, 'attach_hitloc', Vector(0, 0, 0), true);
        ParticleManager.SetParticleControlEnt(pfx, 2, this.GetCaster(), ParticleAttachment.POINT_FOLLOW, 'attach_hitloc', Vector(0, 0, 0), true);
        ParticleManager.DestroyParticle(pfx, false);
        ParticleManager.ReleaseParticleIndex(pfx);
    }
}

@registerModifier()
class god_strength_modifire extends BaseModifier {
    unit;
    OnCreated(params: object): void {
        if (!IsServer()) return;
        this.PlayEffect();
        const unit = this.GetParent();
        this.unit = unit;
        // unit.SetModelScale(unit.GetModelScale() + 0.3);
        this.PlayEffect1();
        this.OnTakeDamage();
    }

    OnAttackLanded(event: ModifierAttackEvent): void {
        if (!IsServer()) return;
        if (event.attacker != this.GetParent()) return;
        const target = event.target;
        if (!target || target.IsNull()) return;
        ParticleManager.CreateParticle(
            'particles/units/heroes/hero_marci/marci_unleash_attack_model.vpcf',
            ParticleAttachment.ABSORIGIN_FOLLOW,
            this.GetParent()
        );
        ParticleManager.CreateParticle('particles/earthshaker_totem_ti6_blur_v2_hit.vpcf', ParticleAttachment.ABSORIGIN_FOLLOW, target);
        const damageTable = {
            victim: target,
            attacker: this.GetCaster(),
            damage: this.GetCaster().GetAverageTrueAttackDamage(this.GetCaster()) * 0.5 + 10,
            damage_type: DamageTypes.PHYSICAL,
            damage_flags: DamageFlag.NONE,
            ability: this.GetAbility(),
        };
        CustomApplyDamage(damageTable);
    }

    //击退伤害
    OnTakeDamage(): void {
        // 冲锋伤害
        const caster = this.GetParent();
        const loc = caster.GetAbsOrigin();
        const enemies = FindUnitsInRadius(
            caster.GetTeamNumber(),
            loc,
            null,
            400,
            UnitTargetTeam.ENEMY,
            UnitTargetType.HERO + UnitTargetType.BASIC + UnitTargetType.BUILDING,
            UnitTargetFlags.NOT_MAGIC_IMMUNE_ALLIES,
            0,
            false
        );
        const ability = this.GetAbility();
        //伤害处理
        enemies.forEach(target => {
            target.AddNewModifier(caster, ability, 'modifier_knockback', {
                duration: 0.8,
                center_x: loc.x, //击退中心点
                center_y: loc.y, //击退中心点
                center_z: loc.z, //击退中心点
                should_stun: true, //是否晕眩
                knockback_duration: 0.3, //击退时间
                knockback_distance: 150, //击退距离
                knockback_height: 0, //击退高度
            });
            Timers.CreateTimer(0.1, () => {
                if (!caster.IsAlive()) return;
                CustomApplyDamage({
                    victim: target,
                    attacker: caster,
                    damage: caster.GetAverageTrueAttackDamage(caster) * 1 + 20,
                    damage_type: DamageTypes.MAGICAL,
                    ability: this.GetAbility(),
                    type: 19999,
                });
            });
        });
    }

    PlayEffect1() {
        let pfx_name = 'particles/units/heroes/hero_marci/marci_unleash_cast_hands.vpcf';
        const pfx2 = CreateParticleToUnit(pfx_name, 5, this.GetParent(), null, 'attach_attack2');
        const pfx3 = CreateParticleToUnit(pfx_name, 5, this.GetParent(), null, 'attach_attack1');
        pfx_name = 'particles/units/heroes/hero_marci/marci_unleash_stack_bg.vpcf';
        const pfx4 = CreateParticleToUnit(pfx_name, 5, this.GetParent(), null, 'attach_attack1');
        const pfx5 = CreateParticleToUnit(pfx_name, 5, this.GetParent(), null, 'attach_attack2');
        const eff = ParticleManager.CreateParticle('particles/phoenix_ambient_red.vpcf', ParticleAttachment.ABSORIGIN_FOLLOW, this.GetParent());
        const eff2 = ParticleManager.CreateParticle(
            'particles/units/heroes/hero_marci/marci_unleash_cast.vpcf',
            ParticleAttachment.ABSORIGIN_FOLLOW,
            this.GetParent()
        );
        this.AddParticle(eff, true, false, 15, false, false);
        this.AddParticle(eff2, true, false, 15, false, false);
        this.AddParticle(pfx2.handle, true, false, 15, false, false);
        this.AddParticle(pfx3.handle, true, false, 15, false, false);
        this.AddParticle(pfx4.handle, true, false, 15, false, false);
        this.AddParticle(pfx5.handle, true, false, 15, false, false);
    }

    PlayEffect() {
        const pfx_name = 'particles/units/heroes/hero_life_stealer/life_stealer_rage.vpcf';
        const pfx = ParticleManager.CreateParticle(pfx_name, ParticleAttachment.CUSTOMORIGIN_FOLLOW, this.GetParent());
        ParticleManager.SetParticleControlEnt(pfx, 0, this.GetParent(), ParticleAttachment.POINT_FOLLOW, 'attach_hitloc', Vector(0, 0, 0), true);
        ParticleManager.SetParticleControlEnt(pfx, 1, this.GetParent(), ParticleAttachment.POINT_FOLLOW, 'attach_hitloc', Vector(0, 0, 0), true);
        ParticleManager.SetParticleControlEnt(pfx, 2, this.GetParent(), ParticleAttachment.POINT_FOLLOW, 'attach_hitloc', Vector(0, 0, 0), true);

        this.AddParticle(pfx, true, false, 15, false, false);
    }

    GetStatusEffectName(): string {
        return 'particles/status_fx/status_effect_life_stealer_rage.vpcf';
    }

    DeclareFunctions(): ModifierFunction[] {
        return [
            ModifierFunction.INCOMING_DAMAGE_PERCENTAGE,
            ModifierFunction.HEALTH_REGEN_CONSTANT,
            ModifierFunction.ATTACKSPEED_BONUS_CONSTANT,
            ModifierFunction.DAMAGEOUTGOING_PERCENTAGE,
            ModifierFunction.ON_ATTACK_LANDED,
        ];
    }

    GetModifierIncomingDamage_Percentage(event: ModifierAttackEvent): number {
        if (this.GetCaster() == event.target) {
            return -40;
        }
    }

    GetModifierConstantHealthRegen(): number {
        return 5;
    }

    GetModifierAttackSpeedBonus_Constant(): number {
        return 60;
    }

    GetModifierDamageOutgoing_Percentage(event: ModifierAttackEvent): number {
        return 20;
    }

    OnDestroy(): void {
        if (!IsServer()) return;
        const unit = this.unit;
        if (unit && !unit.IsNull()) {
            // unit.SetModelScale(unit.GetModelScale() - 0.3);
        }
    }
}
