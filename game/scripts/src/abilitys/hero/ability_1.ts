//particles/econ/items/undying/undying_pale_augur/undying_pale_augur_decay.vpcf
//毒爆
import { BaseAbility, registerAbility } from '../../utils/dota_ts_adapter';

@registerAbility()
class ability_1 extends BaseAbility {
    Precache(context: CScriptPrecacheContext): void {
        print('加载资源文件');
        PrecacheResource('particle', 'particles/econ/items/undying/undying_pale_augur/undying_pale_augur_decay.vpcf', context);
    }

    GetAOERadius() {
        return 400;
    }

    OnSpellStart() {
        //技能释放点
        const target_point = this.GetCursorPosition();
        const particle_cast = 'particles/econ/items/undying/undying_pale_augur/undying_pale_augur_decay.vpcf';
        const sound_cast = 'Hero_Undying.Decay.Cast';
        const effect_cast = ParticleManager.CreateParticle(particle_cast, ParticleAttachment.WORLDORIGIN, this.GetCaster());
        ParticleManager.SetParticleControl(effect_cast, 0, target_point);
        ParticleManager.SetParticleControl(effect_cast, 1, Vector(400, 0, 0));
        ParticleManager.ReleaseParticleIndex(effect_cast);
        ScreenShake(this.GetCaster().GetAbsOrigin(), 5, 5, 0.1, 1000, 0, true);
        EmitSoundOnLocationWithCaster(target_point, sound_cast, this.GetCaster());
        let n = 3;
        //绑定一个上下文计时器
        this.SetContextThink(
            'OnSpellStart',
            () => {
                this.AOEDamage(target_point);
                if (n-- <= 0) return -1; //返回时间则重复运行,返回-1则终止
                return 0.25;
            },
            0.1
        );
    }

    //范围伤害
    AOEDamage(pos: Vector) {
        const enemies = FindUnitsInRadius(
            this.GetCaster().GetTeamNumber(),
            pos,
            null,
            400,
            UnitTargetTeam.ENEMY,
            UnitTargetType.HERO + UnitTargetType.BASIC + UnitTargetType.BUILDING,
            UnitTargetFlags.NONE,
            FindOrder.ANY,
            false
        );
        if (enemies.length > 0) {
            const hero = this.GetCaster() as CDOTA_BaseNPC_Hero;
            enemies.forEach(unit => {
                const damage = hero.GetAverageTrueAttackDamage(hero) * 0.5;
                const damageTable = {
                    victim: unit,
                    attacker: this.GetCaster(),
                    damage: damage,
                    damage_type: DamageTypes.MAGICAL,
                    damage_flags: DamageFlag.NONE,
                    ability: this,
                    type: 19999,
                };
                unit.AddNewModifier(unit, this, 'modifier_stunned', { duration: 0.1 });
                ApplyDamage(damageTable);
            });
        }
    }
}
