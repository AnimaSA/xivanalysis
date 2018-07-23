import React from 'react'

import STATUSES from 'data/STATUSES'
import Module from 'parser/core/Module'
import {Group, Item} from 'parser/core/modules/Timeline'

// Are other jobs going to need to add to this?
const RAID_BUFFS = [
	STATUSES.THE_BALANCE.id, // Would be cool to put these all on the same line, player can only have one up at a time anyway
	STATUSES.THE_ARROW.id,
	STATUSES.THE_SPEAR.id,
	STATUSES.BATTLE_LITANY.id,
	STATUSES.BATTLE_VOICE.id, // notBRD
	STATUSES.MEDITATIVE_BROTHERHOOD.id,
	STATUSES.CHAIN_STRATAGEM.id,
	// STATUSES.CRITIAL_UP.id // this should be up 100% - worth putting in here?
	STATUSES.EMBOLDEN_PHYSICAL.id, // phys only?
	STATUSES.FOE_REQUIEM_DEBUFF.id,
	STATUSES.HYPERCHARGE_VULNERABILITY_UP.id,
	STATUSES.LEFT_EYE.id, // add, notDRG
	STATUSES.TRICK_ATTACK_VULNERABILITY_UP.id,
	// STATUSES.RADIANT_SHIELD_PHYSICAL_VULNERABILITY_UP.id,
	STATUSES.CONTAGION_MAGIC_VULNERABILITY_UP.id,
]

export default class RaidBuffs extends Module {
	static handle = 'raidBuffs'
	static dependencies = [
		'timeline',
		'enemies',
	]

	_group = null
	_buffs = {}

	constructor(...args) {
		super(...args)

		// Set up a group that'll act as a parent for all our stuff
		this._group = new Group({
			id: 'raidbuffs',
			content: 'Raid Buffs',
			order: 0,
			nestedGroups: [],
		})
		this.timeline.addGroup(this._group)

		// Event hooks
		const filter = {abilityId: RAID_BUFFS}
		this.addHook('applybuff', {...filter, to: 'player'}, this._onApply)
		this.addHook('applydebuff', filter, this._onApply)
		this.addHook('removebuff', {...filter, to: 'player'}, this._onRemove)
		this.addHook('removedebuff', filter, this._onRemove)
	}

	_onApply(event) {
		// Only track active enemies when it's a debuff
		if (event.type.includes('debuff') && !this.enemies.isActive(event.targetID, event.targetInstance)) {
			return
		}

		const buffs = this.getTargetBuffs(event)
		const statusId = event.ability.guid

		// Make sure there's a nested group for us
		const groupId = 'raidbuffs-' + statusId
		if (!this._group.nestedGroups.includes(groupId)) {
			this.timeline.addGroup(new Group({
				id: groupId,
				content: event.ability.name,
			}))
			this._group.nestedGroups.push(groupId)
		}

		// Generate an item for the buff
		// TODO: startTime should probably be automated inside timeline
		const startTime = this.parser.fight.start_time
		const status = STATUSES[statusId]
		buffs[statusId] = new Item({
			type: 'background',
			start: event.timestamp - startTime,
			group: groupId,
			content: <img src={status.icon} alt={status.name}/>,
		})
	}

	_onRemove(event) {
		// Only track active enemies
		if (event.type.includes('debuff') && !this.enemies.isActive(event.targetID, event.targetInstance)) {
			return
		}

		const item = this.getTargetBuffs(event)[event.ability.guid]
		// This shouldn't happen, but it do.
		if (!item) { return }

		item.end = event.timestamp - this.parser.fight.start_time
		this.timeline.addItem(item)
	}

	getTargetBuffs(event) {
		return this._buffs[event.targetID] = this._buffs[event.targetID] || {}
	}
}
