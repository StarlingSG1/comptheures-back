import http from 'http'

import express from 'express'
import cors from 'cors'
import passport from 'passport'
import { PrismaClient } from '@prisma/client'

// Rest API
import routes from './routes'
import injectResponseHelpers from './middlewares/inject-response-helpers'
import './middlewares/passport'

export function launch(port: number): void {
  /* Initialize */

  // Express Application
  const application = express()

  /* Middlewares */
  application.use(injectResponseHelpers())
  application.use(express.json())
  application.use(express.static('uploads'))
  application.use(express.urlencoded({ extended: true }))
  application.use(cors({ origin: '*' }))
  application.use(passport.initialize())

  application.use(function (error, req, res, next) {
    console.log('Err:', error)
    next()
  })

  /* Routes */
  application.use('/', routes)

  application.listen(port, () => {
    console.log(`Server started at: http://localhost:${port}`);
  });
}
