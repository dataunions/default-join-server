const { Sequelize } = require('sequelize')
const { assert } = require('chai')
const DB = require('../../src/db/DB')
require('dotenv').config()

describe('DB', () => {

	let sequelize
	let db
	let secret

	const DATA_UNION_ADDRESS = '0x12345'
	const CHAIN = 'nonexistent'
	const SECRET_NAME = `Test DU Secret ${Date.now()}`

	before(async () => {
		sequelize = new Sequelize(process.env.TEST_DB_SCHEMA, process.env.TEST_DB_USER, process.env.TEST_DB_PASSWORD, {
			host: process.env.TEST_DB_HOST,
			port: process.env.TEST_DB_PORT,
			dialect: 'mysql',
		})
        
		await sequelize.authenticate()

		db = new DB(sequelize)
	})

	after(async () => {
		await sequelize.close()
	})

	// These tests must run sequentially!
	it('creates app secrets', async () => {
		secret = await db.createAppSecret(DATA_UNION_ADDRESS, CHAIN, SECRET_NAME)
		assert.equal(secret.contract_address, DATA_UNION_ADDRESS)
		assert.equal(secret.chain, CHAIN)
		assert.equal(secret.name, SECRET_NAME)
	})

	it('gets app secrets', async () => {
		const fetchedSecret = await db.getAppSecret(secret.secret)
		assert.deepEqual(fetchedSecret, secret)
	})

	it('deletes app secrets', async () => {
		await db.deleteAppSecret(secret.secret)
        
		const fetchedSecret = await db.getAppSecret(secret.secret)
		assert.isUndefined(fetchedSecret)
	})

})
