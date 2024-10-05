import { BaseAbility, BaseModifier, registerAbility, registerModifier } from '../utils/dota_ts_adapter';

const px1 = 'particles/ti8_hero_effect_detail.vpcf'; //恢复效果

// 自然庇佑
@registerAbility()
class natural_shlter extends BaseAbility {
    OnSpellStart(): void {
        if (!IsServer()) return;
        this.EmitSound('CNY_Beast.HandOfGodHealHero');
        const unit = this.GetCaster();
        CreateParticle({
            model: px1,
            controlPoint: 0,
            unit: unit,
            bone: 'origin',
            time: 5,
        });
        const hp_currnet = this.GetCaster().GetHealth();
        const hp_max = this.GetCaster().GetMaxHealth();
        const recover = (hp_max - hp_currnet) * 0.4 + hp_max * 0.15 + 50;
        this.GetCaster().RecoverBlood(recover, this, '治疗');
        this.GetCaster().AddNewModifier(this.GetCaster(), this, 'natural_shlter_modifire', {
            duration: 5,
        });
        if (this.GetCaster().HasModifier('natural_shlter_avoid_modifier')) {
            this.GetCaster().RemoveModifierByName('natural_shlter_avoid_modifier');
        }
        this.GetCaster().AddNewModifier(this.GetCaster(), this, 'natural_shlter_avoid_modifier', {
            duration: 0.3,
        });
    }
}

@registerModifier()
class natural_shlter_modifire extends BaseModifier {
    OnCreated(params: object): void {
        if (!IsServer()) return;
    }

    DeclareFunctions(): ModifierFunction[] {
        return [ModifierFunction.HEALTH_REGEN_PERCENTAGE];
    }

    GetModifierHealthRegenPercentage(): number {
        return 5;
    }
}

@registerModifier()
class natural_shlter_avoid_modifier extends BaseModifier {
    OnCreated(params: object): void {
        if (!IsServer()) return;
    }

    GetModifierAvoidDamage(event): number {
        return 1;
    }

    DeclareFunctions(): ModifierFunction[] {
        return [ModifierFunction.AVOID_DAMAGE];
    }
}
