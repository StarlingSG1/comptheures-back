import { Request, Response, NextFunction } from 'express'

type Error = {
  code: string
  status: number
  message: string
  metadata?: Record<string, unknown>
}

export default () => {
  return (_: Request, response: Response, next: NextFunction) => {
    response.error = function(error: Error | Error[] ): void {
      if (!Array.isArray(error)) {
        this.status(error.status).json({
          error: { code: error.code, message: error.message },
        })

        return
      }

      this.status(error[0].status || 400).json({
        errors: error,
      })
    }
    
    response.success = function({ status, payload }: { status: number, payload?: unknown }): void {
      if(!payload) {
        return this.status(status).end()
      }

      this.status(status).json({ data: payload })
    }
    
    next()
  }
}