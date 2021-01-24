import * as express from 'express'

const app = (app: express.Application) => {
  app.get('/app', (req: express.Request, res: express.Response) => {
    res.send('Hello World')
  })
}

export { app }