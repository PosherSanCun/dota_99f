import { BaseAbility, BaseModifier, registerAbility, registerModifier } from '../utils/dota_ts_adapter';
//旋风斧
@registerAbility()
class duty_axe_counter_helix extends BaseAbility {
    // GetIntrinsicModifierName(): string {
    //     return 'modifer_duty_axe_counter_helix';
    // }
}

@registerModifier()
class modifer_duty_axe_counter_helix extends BaseModifier {
    time: number = 0;
    OnCreated(params: object): void {
        if (!IsServer()) return;
    }

    DeclareFunctions(): ModifierFunction[] {
        return [ModifierFunction.ON_ATTACK_LANDED];
    }

    OnAttackLanded(event: ModifierAttackEvent): void {
        if (!IsServer()) return;
        if (event.attacker != this.GetParent() && event.target != this.GetParent()) return;
        if (event.target.IsBuilding()) return;
        const caster = this.GetCaster();
        //获取英雄的冷却缩减
        const cooldown = caster.GetCooldownReduction();
        const time = GameRules.GetGameTime();
        if (time - this.time < 2 * cooldown) return;
        const pos = event.target.GetAbsOrigin();
        if (RollPseudoRandomPercentage(20, PseudoRandom.CUSTOM_GAME_1, event.attacker)) {
            this.time = time; //冷却时间1.8
            this.GetAbility().StartCooldown(2 * cooldown);
            this.GetParent().StartGesture(GameActivity.DOTA_CAST_ABILITY_3);
            this.PlayEffect();
            this.PlayEffect2();
            const enemies = FindUnitsInRadius(
                caster.GetTeamNumber(),
                pos,
                null,
                300,
                UnitTargetTeam.ENEMY,
                UnitTargetType.HERO + UnitTargetType.BASIC + UnitTargetType.BUILDING,
                UnitTargetFlags.NONE,
                FindOrder.ANY,
                false
            );
            const hero = caster as CDOTA_BaseNPC_Hero;
            const armor = hero.GetPhysicalArmorValue(false);
            const damage = hero.GetStrength() * 6 * (1 + (armor / 5) * 0.01);
            enemies.forEach(unit => {
                const damageTable = {
                    victim: unit,
                    attacker: this.GetCaster(),
                    damage: damage * 0.5,
                    damage_type: DamageTypes.MAGICAL,
                    damage_flags: DamageFlag.NONE,
                    ability: this.GetAbility(),
                };
                const damageTable2 = {
                    victim: unit,
                    attacker: this.GetCaster(),
                    damage: damage * 0.5,
                    damage_type: DamageTypes.PHYSICAL,
                    damage_flags: DamageFlag.NONE,
                    ability: this.GetAbility(),
                };
                CustomApplyDamage(damageTable);
                CustomApplyDamage(damageTable2);
            });

            caster.AddNewModifier(caster, this.GetAbility(), 'modifer_duty_axe_counter_helix_armor', {
                duration: 3.5,
            });
        }
    }

    PlayEffect() {
        const sound_name = 'Hero_Axe.CounterHelix_Blood_Chaser';
        const pfx_name = 'particles/econ/items/axe/axe_weapon_practos/axe_attack_blur_counterhelix_practos.vpcf';
        const pfx_2_name = 'particles/units/heroes/hero_axe/axe_counterhelix.vpcf';
        this.GetParent().EmitSound(sound_name);
        const pfx = ParticleManager.CreateParticle(pfx_name, ParticleAttachment.ABSORIGIN_FOLLOW, this.GetParent());
        ParticleManager.SetParticleControl(pfx, 0, this.GetParent().GetAbsOrigin());
        ParticleManager.ReleaseParticleIndex(pfx);
        const pfx2 = ParticleManager.CreateParticle(pfx_2_name, ParticleAttachment.ABSORIGIN_FOLLOW, this.GetParent());
        ParticleManager.SetParticleControl(pfx2, 0, this.GetParent().GetAbsOrigin());
        ParticleManager.ReleaseParticleIndex(pfx2);
    }

    PlayEffect2() {
        const pfx_name = 'particles/econ/items/axe/axe_weapon_bloodchaser/axe_attack_blur_counterhelix_bloodchaser.vpcf';
        ParticleManager.CreateParticle(pfx_name, ParticleAttachment.ABSORIGIN_FOLLOW, this.GetParent());
    }

    IsHidden(): boolean {
        return true;
    }
}

@registerModifier()
class modifer_duty_axe_counter_helix_armor extends BaseModifier {
    OnCreated(params: object): void {
        if (!IsServer()) return;
        const caster = this.GetCaster() as CDOTA_BaseNPC_Hero;
        this.SetStackCount(1 * caster.GetStackingRate());
    }

    OnRefresh(params: object): void {
        this.SetDuration(3.5, false);
        if (!IsServer()) return;
        const caster = this.GetCaster() as CDOTA_BaseNPC_Hero;
        this.SetStackCount(this.GetStackCount() + 1 * (1 + caster.GetStackingRate()));
        if (this.GetStackCount() > 10) {
            this.SetStackCount(10);
        }
    }

    DeclareFunctions(): ModifierFunction[] {
        return [ModifierFunction.PHYSICAL_ARMOR_BONUS];
    }

    GetModifierPhysicalArmorBonus(event: ModifierAttackEvent): number {
        return this.GetStackCount() * 10;
    }
}
