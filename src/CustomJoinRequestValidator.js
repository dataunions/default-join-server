module.exports = (db) => {
	return async (joinRequest) => {
		if (!joinRequest.secret) {
			throw new Error('App secret not provided!')
		}

		const secret = await db.getAppSecret(joinRequest.secret)
		if (!secret 
            || secret.contract_address.toLowerCase() !== joinRequest.dataUnion.toLowerCase()
            || secret.chain !== joinRequest.chain) {
			throw new Error('Invalid app secret!')
		}
	}
}