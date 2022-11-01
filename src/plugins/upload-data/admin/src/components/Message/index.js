import React from 'react';
import { Typography } from '@strapi/design-system/Typography';

const Message = ({ error, messages }) => {
	return (
		error ?
			<Typography style={{ color: 'red' }} variant="omega" fontWeight="semiBold">ERROR: {error}</Typography> :
			messages.map((msg) => {
				return <Typography variant="omega">{msg}<br/></Typography>
			})
	)
}

export default Message;