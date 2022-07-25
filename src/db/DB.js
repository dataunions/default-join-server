const { QueryTypes } = require('sequelize')
const { v4: uuid } = require('uuid')

class DB {
	constructor(sequelize) {
		this.sequelize = sequelize
	}

	async getAppSecret(secret) {
		const result = await this.sequelize.query(
			'SELECT * FROM data_union_secret WHERE secret = :secret LIMIT 1', {
				replacements: {
					secret,
				},
				type: QueryTypes.SELECT
			}
		)
		console.log(result)
		return result[0]
	}

	async createAppSecret(dataUnionAddress, chain, name) {
		const secret = uuid()
		await this.sequelize.query(
			'INSERT INTO data_union_secret (`secret`, `contract_address`, `chain`, `name`) VALUES (:secret, :dataUnionAddress, :chain, :name)',
			{
				replacements: {
					secret,
					dataUnionAddress,
					chain,
					name,
				},
				type: QueryTypes.INSERT
			}
		)

		return this.getAppSecret(secret)
	}

	async deleteAppSecret(secret) {
		const result = await this.sequelize.query(
			'DELETE FROM data_union_secret WHERE secret = :secret', {
				replacements: {
					secret,
				},
				type: QueryTypes.DELETE
			}
		)
		console.log(result)
	}

}

module.exports = DB