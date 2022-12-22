  
import passport from 'passport'
import prisma from '../helpers/prisma'
import { Strategy as LocalStrategy } from 'passport-local'
import { Strategy as JsonWebTokenStrategy, ExtractJwt } from 'passport-jwt'
import { compare } from 'bcryptjs'

import { WRONG_CREDENTIALS, IN_REGISTRATION } from '../errors/authentication'

passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async (email, password, next) => {

      const user = await prisma.user.findUnique({
        where: { email },
        select: { password: true },
      })
      if (!user || !(await compare(password, user.password))) {
        return next(WRONG_CREDENTIALS, null)
      }
      
      next(null, { email })
    },
  ),
)

passport.use(
  new JsonWebTokenStrategy(
    {
      secretOrKey: process.env.TOKEN_SECRET,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    },
    async ({ email }, next) => {
      const user = await prisma.user.findUnique({
        where: { email },
        select: { email: true },
      })
       
      if (!user) {
        return next(WRONG_CREDENTIALS, null) // renvoie Object object au lieu de Unautorized quand il n'y a pas de user
      }
      

      next(null, { email })
    },
  ),
)
