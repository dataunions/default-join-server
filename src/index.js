const { Sequelize } = require('sequelize')
require('dotenv').config()

const sequelize = new Sequelize(process.env.DB_SCHEMA, process.env.DB_USER, process.env.DB_PASSWORD, {
	host: process.env.DB_HOST,
	port: process.env.DB_PORT,
	dialect: 'mysql',
});

(async () => {
	try {
		await sequelize.authenticate()
		console.log('Database connection established successfully.')
	} catch (error) {
		console.error('Unable to connect to the database:', error)
		process.exit(1)
	}


})()
