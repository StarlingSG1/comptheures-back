import { launch } from './server'

const port = parseInt(process.env.PORT) || 8184
launch(port)
