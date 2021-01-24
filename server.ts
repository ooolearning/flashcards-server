import * as basicAuth from 'express-basic-auth'
import * as bodyParser from 'body-parser'
import * as cors from 'cors'
import * as dotenv from 'dotenv'
import * as express from 'express'
import * as jwt from 'jsonwebtoken'
import * as mysql from 'mysql'

// const mysql = require('mysql')
// require('dotenv').config()
// const express = require('express')
// const bodyParser = require('body-parser')
// const jwt = require('jsonwebtoken')
// const basicAuth = require('express-basic-auth')
// const cors = require('cors')

dotenv.config()

const app = express()

const { log } = console

const connection = () => {
  const temp = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: +process.env.DB_PORT,
    // timezone: '-2:00',
  })
  temp.connect()
  temp.on('error', log)
  return temp
}

const query = async (_query: string | mysql.QueryOptions, _arr: any[]) => await new Promise((resolve, reject) => {
  const con = connection()
  con.query(_query, _arr, (error, results, fields) => {
    log(results)
    error ? reject(error) : resolve(true)
  })
  con.end()
})

const queryOne = async (_query: string | mysql.QueryOptions, _arr: any[]) => await new Promise((resolve, reject) => {
  const con = connection()
  con.query(_query, _arr, (error, results, fields) => {
    log(results[0])
    error ? reject(error) : resolve(results[0])
  })
  con.end()
})

const queryAll = async (_query: string | mysql.QueryOptions, _arr: any[]) => await new Promise((resolve, reject) => {
  const con = connection()
  con.query(_query, _arr, (error, results, fields) => {
    log(results)
    error ? reject(error) : resolve(results)
  })
  con.end()
})

app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.use(basicAuth({
  users: { 'ooolearning': '1234' },
  unauthorizedResponse: { message: 'Unauthorized' },
}))

interface CustomRequest extends Request {
  user: any
}

const verifyJWT = (req: CustomRequest, res: express.Response, next: express.NextFunction) => {
  const token: string = req.headers['token'].toString()
  if (!token) return res.status(401).json({ message: 'No token provided' })
  jwt.verify(token, process.env.SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Failed to authenticate token' })
    req.user = decoded
    next()
  })
}

app.use('/', (req, res, next) => {
  log('/')
  res.contentType('application/json')
  next()
})

// user

// @ts-ignore
app.post('/user/login', (req: CustomRequest, res) => {
  log('/user/login')
  const { email, password }: { email: string, password: string } = Object(req.body)
  try {
    if (!email) throw 'Invalid email'
    if (!password) throw 'Invalid password'
    queryOne('select * from user where email = ? and password = sha1(?)', [email, password])
      .then((d: Object) => {
        if (d === undefined) throw 'Wrong email or password'
        const token = jwt.sign({ ...d }, process.env.SECRET, { expiresIn: 300 })
        res.status(200).json({ token })
      })
      .catch((e: Object) => {
        log(e)
        res.status(400).json({ message: e })
      })
  } catch (e) {
    log(e)
    res.status(400).json({ message: e })
  }
})

// @ts-ignore
app.post('/user/create', (req: CustomRequest, res) => {
  log('/user/create')
  const { name, email, password }: { name: string, email: string, password: string } = Object(req.body)
  try {
    if (!name) throw 'Invalid name'
    if (!email) throw 'Invalid email'
    if (!password) throw 'Invalid password'
    query('insert into user (name, email, password) values (?, ?, sha1(?))', [name, email, password])
      .then((d: Object) => {
        if (!d) throw 'Error'
        res.status(201).json({ message: 'User created' })
      })
      .catch((e: Object) => {
        log(e)
        res.status(400).json({ message: e })
      })
  } catch (e) {
    log(e)
    res.status(400).json({ message: e })
  }
})

// todo

// @ts-ignore
app.post('/todo/all', verifyJWT, (req: CustomRequest, res) => {
  log('/todo/all')
  const user_id = req.user.id
  queryAll('select * from todo where user_id = ? order by favorite asc', [user_id])
    .then((d: Object) => res.status(200).json({ todos: d }))
    .catch((e: Object) => {
      log(e)
      res.status(400).json({ message: e })
    })
})

// @ts-ignore
app.post('/todo/favorite', verifyJWT, (req: CustomRequest, res) => {
  log('/todo/favorite')
  const user_id = req.user.id
  const { id }: { id: string } = Object(req.body)
  query('update todo set favorite = \'true\' where user_id = ? and id = ?', [user_id, id])
    .then((d: Object) => res.status(200).json({ message: 'Todo favorited' }))
    .catch((e: Object) => {
      log(e)
      res.status(400).json({ message: e })
    })
})

// @ts-ignore
app.post('/todo/unfavorite', verifyJWT, (req: CustomRequest, res) => {
  log('/todo/unfavorite')
  const user_id = req.user.id
  const { id }: { id: string } = Object(req.body)
  query('update todo set favorite = \'false\' where user_id = ? and id = ?', [user_id, id])
    .then((d: Object) => res.status(200).json({ message: 'Todo unfavorited' }))
    .catch((e: Object) => {
      log(e)
      res.status(400).json({ message: e })
    })
})

// @ts-ignore
app.post('/todo/delete', verifyJWT, (req: CustomRequest, res) => {
  log('/todo/delete')
  const user_id = req.user.id
  const { id }: { id: string } = Object(req.body)
  query('delete from todo where user_id = ? and id = ?', [user_id, id])
    .then((d: Object) => res.status(200).json({ message: 'Todo deleted' }))
    .catch((e: Object) => {
      log(e)
      res.status(400).json({ message: e })
    })
})

// @ts-ignore
app.post('/todo/create', verifyJWT, (req: CustomRequest, res) => {
  log('/todo/create')
  const user_id = req.user.id
  const { title, text }: { title: string, text: string } = Object(req.body)
  query('insert into todo (title, text, user_id) values (?, ?, ?)', [title, text, user_id])
    .then((d: Object) => res.status(201).json({ message: 'Todo created' }))
    .catch((e: Object) => {
      log(e)
      res.status(400).json({ message: e })
    })
})

app.listen(process.env.PORT, () => log(`Listening on port ${process.env.PORT}`))
