import { BaseAbility, BaseModifier, registerAbility, registerModifier } from '../utils/dota_ts_adapter';
//天火
@registerAbility()
class duty_invoker_sun_strike extends BaseAbility {
    GetIntrinsicModifierName(): string {
        return 'duty_invoker_sun_strike_buff';
    }

    GetAOERadius() {
        return 220;
    }

    OnSpellStart(): void {
        const pos = this.GetCursorPosition();
        const caster = this.GetCaster();
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
        this.PlayEffects(pos);
        const hero = caster as CDOTA_BaseNPC_Hero;
        if (enemies.length > 0) {
            const lv = this.GetLevel();
            enemies.forEach(unit => {
                const damage_per_sec = (hero.GetIntellect(true) + caster.GetAverageTrueAttackDamage(caster)) * 3;
                const damageTable = {
                    victim: unit,
                    attacker: this.GetCaster(),
                    damage: damage_per_sec * 0.2 * 1.06 ** caster.GetLevel() * (1 + lv * 0.25),
                    damage_type: DamageTypes.MAGICAL,
                    damage_flags: DamageFlag.NONE,
                    ability: this,
                    type: 19999,
                };
                unit.AddNewModifier(unit, this, 'modifier_stunned', { duration: 1 });
                unit.AddNewModifier(hero, this, 'fire_debuff' + hero.GetPlayerID(), {
                    duration: 3,
                });
                CustomApplyDamage(damageTable);
            });
        }
        caster.AddNewModifier(caster, this, 'sun_strike_duochong_modifier', { x: pos.x, y: pos.y });
    }

    PlayEffects(pos: Vector) {
        const particle_cast = 'particles/units/heroes/hero_invoker/invoker_sun_strike.vpcf';
        const sound_cast = 'Hero_Invoker.SunStrike.Ignite';

        const effect_cast = ParticleManager.CreateParticle(particle_cast, ParticleAttachment.WORLDORIGIN, this.GetCaster());
        ParticleManager.SetParticleControl(effect_cast, 0, pos);
        ParticleManager.SetParticleControl(effect_cast, 1, Vector(300, 0, 0));
        ParticleManager.ReleaseParticleIndex(effect_cast);

        EmitSoundOnLocationWithCaster(pos, sound_cast, this.GetCaster());
    }
}

@registerModifier()
class duty_invoker_sun_strike_buff extends BaseModifier {
    OnCreated(params: object): void {
        if (!IsServer()) return;
    }

    DeclareFunctions(): modifierfunction[] {
        return [ModifierFunction.ON_ABILITY_EXECUTED];
    }

    OnAbilityExecuted(event: ModifierAbilityEvent): void {
        if (event.unit != this.GetParent()) return;
        if (event.ability.GetName() == 'ability01') return;
        if (event.ability.GetManaCost(event.ability.GetLevel()) == 0 && event.ability.GetHealthCost(event.ability.GetLevel()) == 0) return;
        print(this.GetAbility().IsCooldownReady());
        if (!this.GetAbility().IsCooldownReady()) {
            const cd_time = this.GetAbility().GetCooldownTimeRemaining();
            this.GetAbility().EndCooldown();
            this.GetAbility().StartCooldown(cd_time - 1);
        }
    }

    IsHidden(): boolean {
        return true;
    }
}

@registerModifier()
class sun_strike_duochong_modifier extends BaseModifier {
    pos;
    OnCreated(params: any): void {
        if (!IsServer()) return;
        this.pos = Vector(params.x, params.y);
    }

    OnRefresh(params: any): void {
        if (!IsServer()) return;
        this.pos = Vector(params.x, params.y);
    }

    DeclareFunctions(): ModifierFunction[] {
        return [ModifierFunction.ON_ABILITY_FULLY_CAST];
    }

    OnAbilityFullyCast(event: ModifierAbilityEvent): void {
        if (!IsServer()) return;
        if (event.unit != this.GetParent()) return;
        if (this.GetParent().PassivesDisabled()) return;
        let ability;
        if (event.ability.GetName() == 'duty_invoker_sun_strike') {
            ability = event.ability;
            const lv = this.GetAbility().GetLevel();
            if (RollPseudoRandomPercentage(20 + lv * 5, PseudoRandom.OGRE_MAGI_FIREBLAST, this.GetParent())) {
                this.DoMultiPositionAbility(this.GetParent(), this.pos, ability, 2);
            }
        }
    }

    DoMultiPositionAbility(caster: CDOTA_BaseNPC, pos, ability, times) {
        const unit = this.GetParent();
        for (let i = 1; i <= times; i++) {
            Timers.CreateTimer(i * 0.5, () => {
                if (!unit.IsAlive()) return;
                caster.SetCursorPosition(pos);
                ability.OnSpellStart();
                caster.EmitSound('Hero_OgreMagi.Fireblast.x');
                const pfx = ParticleManager.CreateParticle(
                    'particles/econ/items/ogre_magi/ogre_magi_jackpot/ogre_magi_jackpot_multicast.vpcf',
                    ParticleAttachment.OVERHEAD_FOLLOW,
                    caster
                );
                ParticleManager.SetParticleControl(pfx, 1, Vector(2, 1, 0));
                Event.send('多重施法', unit);
                return null;
            });
        }
    }

    IsHidden(): boolean {
        return true;
    }
}

@registerModifier()
class target_stune extends BaseModifier {
    OnCreated(params: object): void {
        if (!IsServer()) return;
    }

    CheckState(): Partial<Record<ModifierState, boolean>> {
        return { [ModifierState.STUNNED]: true };
    }

    GetEffectName(): string {
        return 'particles/generic_gameplay/generic_stunned.vpcf';
    }

    IsStunDebuff(): boolean {
        return true;
    }

    ShouldUseOverheadOffset(): boolean {
        return true;
    }
}
