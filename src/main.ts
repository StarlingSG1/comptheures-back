import { launch } from './server'

const port = parseInt(process.env.PORT) || 8084
launch(port)
