import PropTypes from 'prop-types'
import React, {Component} from 'react'

class JobIcons extends Component {
	static propTypes = {
		job: PropTypes.shape({
			icon: PropTypes.string.isRequired,
		}).isRequired,
		set: PropTypes.number,
		className: PropTypes.string,
	}

	render() {
		const {
			job: {icon},
			set = 2,
			className = '',
		} = this.props

		return <img
			src={`https://secure.xivdb.com/img/classes/set${set}/${icon}.png`}
			alt={icon}
			className={className}
		/>
	}
}

export default JobIcons
