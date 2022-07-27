const { Sequelize } = require('sequelize')
const { JoinServer } = require('@dataunions/join-server')
const DataUnionClient = require('@dataunions/client')
require('dotenv').config()

const DB = require('./db/SecretDB')
const createCustomJoinRequestValidator = require('./CustomJoinRequestValidator')
const createCustomRoutes = require('./CustomRoutes')

const sequelizeForSecrets = new Sequelize(process.env.SECRET_DB_SCHEMA, process.env.SECRET_DB_USER, process.env.SECRET_DB_PASSWORD, {
	host: process.env.SECRET_DB_HOST,
	port: process.env.SECRET_DB_PORT,
	dialect: 'mysql',
})

const db = new DB(sequelizeForSecrets)

;(async () => {
	try {
		await sequelizeForSecrets.authenticate()
		console.log('Database connection established successfully.')
	} catch (error) {
		console.error('Unable to connect to the database:', error)
		process.exit(1)
	}

	const client = new DataUnionClient({
		auth: {
			privateKey: process.env.PRIVATE_KEY,
		}
	})

	const srv = new JoinServer({
		privateKey: process.env.PRIVATE_KEY,
		customJoinRequestValidator: createCustomJoinRequestValidator(db),
		customRoutes: createCustomRoutes(client, db),
	})
	srv.start()

})()
