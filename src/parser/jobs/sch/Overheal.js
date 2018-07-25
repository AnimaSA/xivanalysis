import OverhealModule, {HEALING_WEIGHTS} from 'parser/roles/healer/Overheal'
import ACTIONS from 'data/ACTIONS'

const ACTION_WEIGHTS = {
	[ACTIONS.PHYSICK.id]: HEALING_WEIGHTS.GCD,
	[ACTIONS.ADLOQUIUM.id]: HEALING_WEIGHTS.GCD,
	[ACTIONS.SUCCOR.id]: HEALING_WEIGHTS.GCD,
	[ACTIONS.LUSTRATE.id]: HEALING_WEIGHTS.RESOURCE,
	[ACTIONS.WHISPERING_DAWN.id]: HEALING_WEIGHTS.HOT_TICK,
	[ACTIONS.EOS_EMBRACE.id]: 0,
}


export default class SchOverheal extends OverhealModule {

	HEALING_ACTIONS() { return  Object.keys(ACTION_WEIGHTS).map(e => Number(e)) }

}
