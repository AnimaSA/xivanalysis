import React, {Fragment} from 'react'

import ACTIONS from 'data/ACTIONS'
import Module from 'parser/core/Module'
import {Suggestion, SEVERITY} from 'parser/core/modules/Suggestions'
import {ActionLink} from 'components/ui/DbLink'

// Should this be in the actions data?
const ROUSE_DURATION = 20000

export default class Rouse extends Module {
	static handle = 'rouse'
	static dependencies = [
		'gauge',
		'pets',
		'suggestions',
	]

	_lastRouse = null
	_wasted = 0

	constructor(...args) {
		super(...args)
		this.addHook('cast', {
			by: 'player',
			abilityId: ACTIONS.ROUSE.id,
		}, this._onCastRouse)
		this.addHook('summonpet', this._onSummonPet)
		this.addHook('complete', this._onComplete)
	}

	_onCastRouse(event) {
		this._lastRouse = event.timestamp
	}

	_onSummonPet(event) {
		const diff = event.timestamp - this._lastRouse
		// TODO: Might need to check if the rush is in the opener, 'cus you don't want to be wasting rouse by using it before a petswap.
		if (this._lastRouse === null || diff > ROUSE_DURATION || this.gauge.isRushing()) {
			return
		}
		this._wasted += ROUSE_DURATION - diff
	}

	_onComplete() {
		if (this._wasted > 1000) {
			this.suggestions.add(new Suggestion({
				icon: ACTIONS.ROUSE.icon,
				content: <Fragment>
					Avoid casting <ActionLink {...ACTIONS.ROUSE}/> less than {this.parser.formatDuration(ROUSE_DURATION)} before you swap pets or summon bahamut. Rouse is lost the moment your current pet despawns.
				</Fragment>,
				severity: this._wasted > ROUSE_DURATION? SEVERITY.MAJOR : this._wasted > 5000? SEVERITY.MEDIUM : SEVERITY.MINOR,
				why: `${this.parser.formatDuration(this._wasted)} of Rouse wasted.`,
			}))
		}
	}
}
