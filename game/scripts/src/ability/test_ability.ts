import { BaseAbility, registerAbility } from '../utils/dota_ts_adapter';
import { reloadable } from '../utils/tstl-utils';
//测试技能
@reloadable
@registerAbility()
class ability_test extends BaseAbility {
    Precache(context: CScriptPrecacheContext): void {
        PrecacheResource('particle', 'particles/dev/library/base_tracking_projectile_model.vpcf', context);
    }

    OnSpellStart(): void {
        //print('开始释放技能了!');
        const point = this.GetOrigin();
        const units = FindUnitsInRadius(
            DotaTeam.NOTEAM,
            point,
            null,
            500,
            UnitTargetTeam.ENEMY,
            UnitTargetType.ALL,
            UnitTargetFlags.NONE,
            FindOrder.FARTHEST,
            false
        );

        units.forEach(unit => {
            print(unit.GetUnitName());
            const projecs: CreateBaseProjectileOptions = {
                Ability: this,
                EffectName: 'particles/dev/library/base_tracking_projectile_model.vpcf',
                Source: this.GetCaster(),
                Target: unit,
                bDodgeable: false,
                iMoveSpeed: 600,
            }ProjectileManager.CreateTrackingProjectile(projecs);
        });
    }

    OnAbilityPhaseStart(): boolean {
        print('当技能开始释放了!');
        return true;
    }
}
