const { Sequelize } = require('sequelize')
const DB = require('./db/DB')
const JoinServer = require('@dataunions/join-server')
const DataUnionClient = require('@dataunions/client')
require('dotenv').config()

const sequelize = new Sequelize(process.env.DB_SCHEMA, process.env.DB_USER, process.env.DB_PASSWORD, {
	host: process.env.DB_HOST,
	port: process.env.DB_PORT,
	dialect: 'mysql',
})

const db = new DB(sequelize);

(async () => {
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
        
		// Used to validate custom fields in join requests. The default function does nothing.
		customJoinRequestValidator: async (joinRequest) => {
			const secret = await db.getAppSecret(joinRequest.secret)
			if (!secret 
                || secret.contract_address.toLowerCase() !== joinRequest.dataUnion.toLowerCase()
                || secret.chain !== joinRequest.chain) {
				throw new Error('Invalid app secret!')
			}
		},
    
		// Used to add custom routes to the HTTP server. The default function does nothing.
		customRoutes: (expressApp) => {

			// Owner authenticator middleware for the secrets management routes
			expressApp.use('/secrets/*', async (req, res, next) => {
				const dataUnion = await client.getDataUnion(req.validatedRequest.dataUnion)
				const owner = await dataUnion.getOwner()
				if (owner.toLowerCase() === req.body.address.toLowerCase()) {
					next()
				} else {
					res.status(403)
					res.set('content-type', 'application/json')
					res.send({
						error: `This endpoint can only be called by the Data Union owner (${owner})`
					})
				}
			})

			expressApp.post('/secrets/list', async (req, res) => {
				// Get secrets from DB
				const secrets = await db.listSecrets(req.validatedRequest.dataUnion, req.validatedRequest.chain)

				res.status(200)
				res.set('content-type', 'application/json')
				res.send(secrets)
			})

			expressApp.post('/secrets/create', async (req, res) => {
				// Insert new secret to DB
				const secret = await db.createAppSecret(req.validatedRequest.dataUnion, req.validatedRequest.chain, req.validatedRequest.name)

				res.status(200)
				res.set('content-type', 'application/json')
				res.send(secret)
			})

			expressApp.delete('/secrets/delete', async (req, res) => {
				const secret = await db.getAppSecret(req.validatedRequest.secret)

				if (secret) {
					// Delete secret
					await db.deleteAppSecret(secret.secret)

					res.status(200)
					res.set('content-type', 'application/json')
					res.send(secret)
				} else {
					res.status(404)
					res.set('content-type', 'application/json')
					res.send({
						error: 'Secret not found'
					})
				}
			})
		},
	})
	srv.start()

})()
