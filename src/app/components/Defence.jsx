import React from 'react';
import TranslatedComponent from './TranslatedComponent';
import * as Calc from '../shipyard/Calculations';
import PieChart from './PieChart';
import VerticalBarChart from './VerticalBarChart';

/**
 * Defence information
 * Shield information consists of four panels:
 *   - textual information (time to lose shields etc.)
 *   - breakdown of shield sources (pie chart)
 *   - comparison of shield resistances (bar chart)
 *   - effective shield (bar chart)
 */
export default class Defence extends TranslatedComponent {
  static propTypes = {
    marker: React.PropTypes.string.isRequired,
    ship: React.PropTypes.object.isRequired,
    opponent: React.PropTypes.object.isRequired,
    engagementrange: React.PropTypes.number.isRequired,
    sys: React.PropTypes.number.isRequired,
    opponentWep: React.PropTypes.number.isRequired
  };

  /**
   * Constructor
   * @param  {Object} props   React Component properties
   */
  constructor(props) {
    super(props);

    const { shield, armour, shielddamage, armourdamage } = Calc.defenceMetrics(props.ship, props.opponent, props.sys, props.opponentWep, props.engagementrange);
    this.state = { shield, armour, shielddamage, armourdamage };
  }

  /**
   * Update the state if our properties change
   * @param  {Object} nextProps   Incoming/Next properties
   * @return {boolean}            Returns true if the component should be rerendered
   */
  componentWillReceiveProps(nextProps) {
    if (this.props.marker != nextProps.marker || this.props.sys != nextProps.sys) {
      const { shield, armour, shielddamage, armourdamage } = Calc.defenceMetrics(nextProps.ship, nextProps.opponent, nextProps.sys, nextProps.opponentWep, nextProps.engagementrange);
      this.setState({ shield, armour, shielddamage, armourdamage });
    }
    return true;
  }

  /**
   * Render defence
   * @return {React.Component} contents
   */
  render() {
    const { ship, sys, opponentWep } = this.props;
    const { language, tooltip, termtip } = this.context;
    const { formats, translate, units } = language;
    const { shield, armour, shielddamage, armourdamage } = this.state;

    const pd = ship.standard[4].m;

    const shieldSourcesData = [];
    const effectiveShieldData = [];
    const shieldDamageTakenData = [];
    const shieldTooltipDetails = [];
    const shieldAbsoluteTooltipDetails = [];
    const shieldExplosiveTooltipDetails = [];
    const shieldKineticTooltipDetails = [];
    const shieldThermalTooltipDetails = [];
    let maxEffectiveShield = 0;
    if (shield.total) {
      shieldSourcesData.push({ value: Math.round(shield.generator), label: translate('generator') });
      shieldSourcesData.push({ value: Math.round(shield.boosters), label: translate('boosters') });
      shieldSourcesData.push({ value: Math.round(shield.cells), label: translate('cells') });

      if (shield.generator > 0) shieldTooltipDetails.push(<div key='generator'>{translate('generator') + ' ' + formats.int(shield.generator)}{units.MJ}</div>);
      if (shield.boosters > 0) shieldTooltipDetails.push(<div key='boosters'>{translate('boosters') + ' ' + formats.int(shield.boosters)}{units.MJ}</div>);
      if (shield.cells > 0) shieldTooltipDetails.push(<div key='cells'>{translate('cells') + ' ' + formats.int(shield.cells)}{units.MJ}</div>);

      shieldAbsoluteTooltipDetails.push(<div key='generator'>{translate('generator') + ' ' + formats.pct1(shield.absolute.generator)}</div>);
      shieldAbsoluteTooltipDetails.push(<div key='boosters'>{translate('boosters') + ' ' + formats.pct1(shield.absolute.boosters)}</div>);
      shieldAbsoluteTooltipDetails.push(<div key='power distributor'>{translate('power distributor') + ' ' + formats.pct1(shield.absolute.sys)}</div>);

      shieldExplosiveTooltipDetails.push(<div key='generator'>{translate('generator') + ' ' + formats.pct1(shield.explosive.generator)}</div>);
      shieldExplosiveTooltipDetails.push(<div key='boosters'>{translate('boosters') + ' ' + formats.pct1(shield.explosive.boosters)}</div>);
      shieldExplosiveTooltipDetails.push(<div key='power distributor'>{translate('power distributor') + ' ' + formats.pct1(shield.explosive.sys)}</div>);

      shieldKineticTooltipDetails.push(<div key='generator'>{translate('generator') + ' ' + formats.pct1(shield.kinetic.generator)}</div>);
      shieldKineticTooltipDetails.push(<div key='boosters'>{translate('boosters') + ' ' + formats.pct1(shield.kinetic.boosters)}</div>);
      shieldKineticTooltipDetails.push(<div key='power distributor'>{translate('power distributor') + ' ' + formats.pct1(shield.kinetic.sys)}</div>);

      shieldThermalTooltipDetails.push(<div key='generator'>{translate('generator') + ' ' + formats.pct1(shield.thermal.generator)}</div>);
      shieldThermalTooltipDetails.push(<div key='boosters'>{translate('boosters') + ' ' + formats.pct1(shield.thermal.boosters)}</div>);
      shieldThermalTooltipDetails.push(<div key='power distributor'>{translate('power distributor') + ' ' + formats.pct1(shield.thermal.sys)}</div>);

      const effectiveAbsoluteShield = shield.total / shield.absolute.total;
      effectiveShieldData.push({ value: Math.round(effectiveAbsoluteShield), label: translate('absolute') });
      const effectiveExplosiveShield = shield.total / shield.explosive.total;
      effectiveShieldData.push({ value: Math.round(effectiveExplosiveShield), label: translate('explosive') });
      const effectiveKineticShield = shield.total / shield.kinetic.total;
      effectiveShieldData.push({ value: Math.round(effectiveKineticShield), label: translate('kinetic') });
      const effectiveThermalShield = shield.total / shield.thermal.total;
      effectiveShieldData.push({ value: Math.round(effectiveThermalShield), label: translate('thermal') });

      shieldDamageTakenData.push({ value: Math.round(shield.absolute.total * 100), label: translate('absolute'), tooltip: shieldAbsoluteTooltipDetails });
      shieldDamageTakenData.push({ value: Math.round(shield.explosive.total * 100), label: translate('explosive'), tooltip: shieldExplosiveTooltipDetails });
      shieldDamageTakenData.push({ value: Math.round(shield.kinetic.total * 100), label: translate('kinetic'), tooltip: shieldKineticTooltipDetails });
      shieldDamageTakenData.push({ value: Math.round(shield.thermal.total * 100), label: translate('thermal'), tooltip: shieldThermalTooltipDetails });

      maxEffectiveShield = Math.max(shield.total / shield.absolute.max, shield.total / shield.explosive.max, shield.total / shield.kinetic.max, shield.total / shield.thermal.max);
    }

    const armourSourcesData = [];
    armourSourcesData.push({ value: Math.round(armour.bulkheads), label: translate('bulkheads') });
    armourSourcesData.push({ value: Math.round(armour.reinforcement), label: translate('reinforcement') });

    const armourTooltipDetails = [];
    if (armour.bulkheads > 0) armourTooltipDetails.push(<div key='bulkheads'>{translate('bulkheads') + ' ' + formats.int(armour.bulkheads)}</div>);
    if (armour.reinforcement > 0) armourTooltipDetails.push(<div key='reinforcement'>{translate('reinforcement') + ' ' + formats.int(armour.reinforcement)}</div>);

    const armourAbsoluteTooltipDetails = [];
    armourAbsoluteTooltipDetails.push(<div key='bulkheads'>{translate('bulkheads') + ' ' + formats.pct1(armour.absolute.bulkheads)}</div>);
    armourAbsoluteTooltipDetails.push(<div key='reinforcement'>{translate('reinforcement') + ' ' + formats.pct1(armour.absolute.reinforcement)}</div>);

    const armourExplosiveTooltipDetails = [];
    armourExplosiveTooltipDetails.push(<div key='bulkheads'>{translate('bulkheads') + ' ' + formats.pct1(armour.explosive.bulkheads)}</div>);
    armourExplosiveTooltipDetails.push(<div key='reinforcement'>{translate('reinforcement') + ' ' + formats.pct1(armour.explosive.reinforcement)}</div>);

    const armourKineticTooltipDetails = [];
    armourKineticTooltipDetails.push(<div key='bulkheads'>{translate('bulkheads') + ' ' + formats.pct1(armour.kinetic.bulkheads)}</div>);
    armourKineticTooltipDetails.push(<div key='reinforcement'>{translate('reinforcement') + ' ' + formats.pct1(armour.kinetic.reinforcement)}</div>);

    const armourThermalTooltipDetails = [];
    armourThermalTooltipDetails.push(<div key='bulkheads'>{translate('bulkheads') + ' ' + formats.pct1(armour.thermal.bulkheads)}</div>);
    armourThermalTooltipDetails.push(<div key='reinforcement'>{translate('reinforcement') + ' ' + formats.pct1(armour.thermal.reinforcement)}</div>);

    const effectiveArmourData = [];
    const effectiveAbsoluteArmour = armour.total / armour.absolute.total;
    effectiveArmourData.push({ value: Math.round(effectiveAbsoluteArmour), label: translate('absolute') });
    const effectiveExplosiveArmour = armour.total / armour.explosive.total;
    effectiveArmourData.push({ value: Math.round(effectiveExplosiveArmour), label: translate('explosive') });
    const effectiveKineticArmour = armour.total / armour.kinetic.total;
    effectiveArmourData.push({ value: Math.round(effectiveKineticArmour), label: translate('kinetic') });
    const effectiveThermalArmour = armour.total / armour.thermal.total;
    effectiveArmourData.push({ value: Math.round(effectiveThermalArmour), label: translate('thermal') });

    const armourDamageTakenData = [];
    armourDamageTakenData.push({ value: Math.round(armour.absolute.total * 100), label: translate('absolute'), tooltip: armourAbsoluteTooltipDetails });
    armourDamageTakenData.push({ value: Math.round(armour.explosive.total * 100), label: translate('explosive'), tooltip: armourExplosiveTooltipDetails });
    armourDamageTakenData.push({ value: Math.round(armour.kinetic.total * 100), label: translate('kinetic'), tooltip: armourKineticTooltipDetails });
    armourDamageTakenData.push({ value: Math.round(armour.thermal.total * 100), label: translate('thermal'), tooltip: armourThermalTooltipDetails });

    return (
      <span id='defence'>
        {shield.total ? <span>
        <div className='group quarter'>
          <h2>{translate('shield metrics')}</h2>
          <br/>
          <h2 onMouseOver={termtip.bind(null, <div>{shieldTooltipDetails}</div>)} onMouseOut={tooltip.bind(null, null)} className='summary'>{translate('raw shield strength')}<br/>{formats.int(shield.total)}{units.MJ}</h2>
          <h2 onMouseOver={termtip.bind(null, translate('TT_TIME_TO_LOSE_SHIELDS'))} onMouseOut={tooltip.bind(null, null)}>{translate('PHRASE_TIME_TO_LOSE_SHIELDS')}<br/>{shielddamage.totalsdps == 0 ? translate('ever') : formats.time(Calc.timeToDeplete(shield.total, shielddamage.totalsdps, shielddamage.totalseps, pd.getWeaponsCapacity(), pd.getWeaponsRechargeRate() * opponentWep / 4))}</h2>
          <h2 onMouseOver={termtip.bind(null, translate('PHRASE_SG_RECOVER'))} onMouseOut={tooltip.bind(null, null)}>{translate('PHRASE_TIME_TO_RECOVER_SHIELDS')}<br/>{shield.recover === Math.Inf ? translate('never') : formats.time(shield.recover)}</h2>
          <h2 onMouseOver={termtip.bind(null, translate('PHRASE_SG_RECHARGE'))} onMouseOut={tooltip.bind(null, null)}>{translate('PHRASE_TIME_TO_RECHARGE_SHIELDS')}<br/>{shield.recharge === Math.Inf ? translate('never') : formats.time(shield.recharge)}</h2>
        </div>
        <div className='group quarter'>
          <h2 onMouseOver={termtip.bind(null, translate('PHRASE_SHIELD_SOURCES'))} onMouseOut={tooltip.bind(null, null)}>{translate('shield sources')}</h2>
          <PieChart data={shieldSourcesData} />
        </div>
        <div className='group quarter'>
          <h2 onMouseOver={termtip.bind(null, translate('PHRASE_DAMAGE_TAKEN'))} onMouseOut={tooltip.bind(null, null)}>{translate('damage taken')}(%)</h2>
          <VerticalBarChart data={shieldDamageTakenData} yMax={140} />
        </div>
        <div className='group quarter'>
          <h2 onMouseOver={termtip.bind(null, translate('PHRASE_EFFECTIVE_SHIELD'))} onMouseOut={tooltip.bind(null, null)}>{translate('effective shield')}(MJ)</h2>
          <VerticalBarChart data={effectiveShieldData} yMax={maxEffectiveShield}/>
        </div>
        </span> : null }

        <div className='group quarter'>
          <h2>{translate('armour metrics')}</h2>
          <h2 onMouseOver={termtip.bind(null, <div>{armourTooltipDetails}</div>)} onMouseOut={tooltip.bind(null, null)} className='summary'>{translate('raw armour strength')}<br/>{formats.int(armour.total)}</h2>
          <h2 onMouseOver={termtip.bind(null, translate('TT_TIME_TO_LOSE_ARMOUR'))} onMouseOut={tooltip.bind(null, null)}>{translate('PHRASE_TIME_TO_LOSE_ARMOUR')}<br/>{armourdamage.totalsdps == 0 ? translate('ever') : formats.time(Calc.timeToDeplete(armour.total, armourdamage.totalsdps, armourdamage.totalseps, pd.getWeaponsCapacity(), pd.getWeaponsRechargeRate() * opponentWep / 4))}</h2>
          <h2 onMouseOver={termtip.bind(null, translate('TT_MODULE_ARMOUR'))} onMouseOut={tooltip.bind(null, null)}>{translate('raw module armour')}<br/>{formats.int(armour.modulearmour)}</h2>
          <h2 onMouseOver={termtip.bind(null, translate('TT_MODULE_PROTECTION_EXTERNAL'))} onMouseOut={tooltip.bind(null, null)}>{translate('PHRASE_MODULE_PROTECTION_EXTERNAL')}<br/>{formats.pct1(armour.moduleprotection / 2)}</h2>
          <h2 onMouseOver={termtip.bind(null, translate('TT_MODULE_PROTECTION_INTERNAL'))} onMouseOut={tooltip.bind(null, null)}>{translate('PHRASE_MODULE_PROTECTION_INTERNAL')}<br/>{formats.pct1(armour.moduleprotection)}</h2>
          <br/>
        </div>
        <div className='group quarter'>
          <h2 onMouseOver={termtip.bind(null, translate('PHRASE_ARMOUR_SOURCES'))} onMouseOut={tooltip.bind(null, null)}>{translate('armour sources')}</h2>
          <PieChart data={armourSourcesData} />
        </div>
        <div className='group quarter'>
          <h2 onMouseOver={termtip.bind(null, translate('PHRASE_DAMAGE_TAKEN'))} onMouseOut={tooltip.bind(null, null)}>{translate('damage taken')}(%)</h2>
          <VerticalBarChart data={armourDamageTakenData} yMax={100} />
        </div>
        <div className='group quarter'>
          <h2 onMouseOver={termtip.bind(null, translate('PHRASE_EFFECTIVE_ARMOUR'))} onMouseOut={tooltip.bind(null, null)}>{translate('effective armour')}</h2>
          <VerticalBarChart data={effectiveArmourData} />
        </div>
      </span>);
  }
}