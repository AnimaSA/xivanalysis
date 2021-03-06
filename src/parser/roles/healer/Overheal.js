import React/*, {Fragment}*/ from 'react'

//import {ActionLink} from 'components/ui/DbLink'
//import ACTIONS from 'data/ACTIONS'
//import STATUSES from 'data/STATUSES'
import Module from 'parser/core/Module'
//import {Rule, Requirement} from 'parser/core/modules/Checklist'
//import {Suggestion, SEVERITY} from 'parser/core/modules/Suggestions'

// Can never be too careful :blobsweat:
/*const STATUS_DURATION = {
	[STATUSES.BIO_II.id]: 30000,
	[STATUSES.MIASMA.id]: 24000,
}*/

// The relative measure of how shitty the action you just wasted was.
// Multiply an action's overheal by this value.
const HEALING_WEIGHTS = {
	GCD: 10,
	RESOURCE: 5,
	OGCD: 3,
	HOT_TICK: 1, // HEHE YEAH BOI
}

export {HEALING_WEIGHTS}

//const SHADOW_FLARE_DURATION = 15000

export default class Overheal extends Module {
	static handle = 'overheal'
	static dependencies = [
		'checklist',
		'combatants',
		'cooldowns',
		'enemies',
		'invuln',
		'suggestions',
	]

	_EVENTS = [];

	get __HEALING_ACTIONS() {
		return this.HEALING_ACTIONS()
	}

	// OVERRIDE ME, RETURN DIRECT HEAL IDS
	HEALING_ACTIONS() {
		return []
	}

	constructor(...args) {
		super(...args)

		const filterActions = {
			by: 'player',
			abilityId: this.__HEALING_ACTIONS,
		}

		const filterPetActions = {
			by: 'pet',
			abilityId: this.__HEALING_ACTIONS,
		}

		console.log(this.__HEALING_ACTIONS)

		this.addHook('heal', filterActions, this._onHealCast)
		this.addHook(['heal', 'cast'], filterPetActions, this._onHealCast)
		this.addHook('complete', () => { console.log('COMPLET') })
	}



	_onHealCast(event) {
		console.log(event)
		this._EVENTS.push(event)
	}

	output() {
		const markup = this._EVENTS.map((ev) => <li key={ev.timestamp}>{ev.ability.name}</li> )
		return <ul>{markup}</ul>
	}

	/*
	_onDotApply(event) {
		const statusId = event.ability.guid

		// Make sure we're tracking for this target
		const lastApplication = this._lastApplication[event.targetID] = this._lastApplication[event.targetID] || {}

		// If it's not been applied yet, set it and skip out
		if (!lastApplication[statusId]) {
			lastApplication[statusId] = event.timestamp
			return
		}

		// Base clip calc
		let clip = STATUS_DURATION[statusId] - (event.timestamp - lastApplication[statusId])

		// Remove any untargetable time from the clip - often want to hardcast after an invuln phase, but refresh w/ 3D shortly after.
		clip -= this.invuln.getUntargetableUptime('all', event.timestamp - STATUS_DURATION[statusId], event.timestamp)

		// Also remove invuln time in the future that casting later would just push dots into
		// TODO: This relies on a full set of invuln data ahead of time. Can this be trusted?
		clip -= this.invuln.getInvulnerableUptime('all', event.timestamp, event.timestamp + STATUS_DURATION[statusId] + clip)

		// Capping clip at 0 - less than that is downtime, which is handled by the checklist requirement
		this._clip[statusId] += Math.max(0, clip)

		lastApplication[statusId] = event.timestamp
	}

	_onComplete() {
		// Checklist rule for dot uptime
		this.checklist.add(new Rule({
			name: 'Keep your DoTs up',
			description: <Fragment>
				As a Scholar, DoTs are a significant portion of your sustained damage. Aim to keep them up at all times.
			</Fragment>,
			requirements: [
				new Requirement({
					name: <Fragment><ActionLink {...ACTIONS.BIO_II} /> uptime</Fragment>,
					percent: () => this.getDotUptimePercent(STATUSES.BIO_II.id),
				}),
				new Requirement({
					name: <Fragment><ActionLink {...ACTIONS.MIASMA} /> uptime</Fragment>,
					percent: () => this.getDotUptimePercent(STATUSES.MIASMA.id),
				}),
				new Requirement({
					name: <Fragment><ActionLink {...ACTIONS.SHADOW_FLARE}/> uptime</Fragment>,
					percent: () => this.getShadowFlareUptimePercent(),
				}),
			],
		}))

		// Suggestion for DoT clipping
		const maxClip = Math.max(...Object.values(this._clip))
		this.suggestions.add(new Suggestion({
			icon: ACTIONS.BIO.icon,
			content: <Fragment>
				Avoid refreshing DoTs significantly before their expiration, except when at the end of the fight. Unnecessary refreshes use up your mana more than necessary, and may cause you to go out of mana.
			</Fragment>,
			severity: maxClip < 10000? SEVERITY.MINOR : maxClip < 30000? SEVERITY.MEDIUM : SEVERITY.MAJOR,
			why: <Fragment>
				{this.parser.formatDuration(this._clip[STATUSES.BIO_II.id])} of {STATUSES[STATUSES.BIO_II.id].name} and {this.parser.formatDuration(this._clip[STATUSES.MIASMA.id])} of {STATUSES[STATUSES.MIASMA.id].name} lost to early refreshes.
			</Fragment>,
		}))
	}

	getDotUptimePercent(statusId) {
		const statusUptime = this.enemies.getStatusUptime(statusId)
		const fightDuration = this.parser.fightDuration - this.invuln.getInvulnerableUptime()

		return (statusUptime / fightDuration) * 100
	}

	getShadowFlareUptimePercent() {
		const fightDuration = this.parser.fightDuration - this.invuln.getInvulnerableUptime()
		// Calc the total number of SF casts you coulda got off (minus the last 'cus floor)
		const maxFullCasts = Math.floor(fightDuration / (ACTIONS.SHADOW_FLARE.cooldown * 1000))

		// Calc the possible time for the last one
		const lastCastMaxDuration = Math.min(
			SHADOW_FLARE_DURATION,
			fightDuration - (maxFullCasts * ACTIONS.SHADOW_FLARE.cooldown)
		)

		const maxTotalDuration = (maxFullCasts * SHADOW_FLARE_DURATION) + lastCastMaxDuration

		// Get as %. Capping to 100%.
		return Math.min(100, (this.combatants.getStatusUptime(STATUSES.SHADOW_FLARE.id) / maxTotalDuration) * 100)
	}

	*/
}
