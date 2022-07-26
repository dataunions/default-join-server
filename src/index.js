const { Sequelize } = require('sequelize')
const { JoinServer } = require('@dataunions/join-server')
const DataUnionClient = require('@dataunions/client')
require('dotenv').config()

const DB = require('./db/DB')
const createCustomJoinRequestValidator = require('./CustomJoinRequestValidator')
const createCustomRoutes = require('./CustomRoutes')

const sequelize = new Sequelize(process.env.DB_SCHEMA, process.env.DB_USER, process.env.DB_PASSWORD, {
	host: process.env.DB_HOST,
	port: process.env.DB_PORT,
	dialect: 'mysql',
})

const db = new DB(sequelize)

;(async () => {
	try {
		await sequelize.authenticate()
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
