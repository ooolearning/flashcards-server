require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const mysql = require('mysql')
const jwt = require('jsonwebtoken')
const basicAuth = require('express-basic-auth')
const cors = require('cors')

const app = express()

const { log } = console

const connection = () => {
  const temp = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    timezone: '-2:00',
  })
  temp.connect()
  temp.on('error', log)
  return temp
}

const query = async (_query, _arr) => await new Promise((resolve, reject) => {
  const con = connection()
  con.query(_query, _arr, (error, results, fields) => log(results) || error ? reject(error) : resolve(true))
  con.end()
})

const queryOne = async (_query, _arr) => await new Promise((resolve, reject) => {
  const con = connection()
  con.query(_query, _arr, (error, results, fields) => log(results[0]) || error ? reject(error) : resolve(results[0]))
  con.end()
})

const queryAll = async (_query, _arr) => await new Promise((resolve, reject) => {
  const con = connection()
  con.query(_query, _arr, (error, results, fields) => log(results) || error ? reject(error) : resolve(results))
  con.end()
})

app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.use(basicAuth({
  users: { 'todo': '1234' },
  unauthorizedResponse: { message: 'Unauthorized' },
}))

const verifyJWT = (req, res, next) => {
  const token = req.headers['token']
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

app.post('/user/login', (req, res) => {
  log('/user/login')
  const { email, password } = req.body
  try {
    if (!email) throw 'Invalid email'
    if (!password) throw 'Invalid password'
    queryOne('select * from user where email = ? and password = sha1(?)', [email, password])
      .then(d => {
        if (d === undefined) throw 'Wrong email or password'
        const token = jwt.sign({ ...d }, process.env.SECRET, { expiresIn: 300 })
        res.status(200).json({ token: token })
      })
      .catch(e => log(e) || res.status(400).json({ message: e }))
  } catch (e) {
    log(e)
    res.status(400).json({ message: e })
  }
})

app.post('/user/create', (req, res) => {
  log('/user/create')
  const { name, email, password } = req.body
  try {
    if (!name) throw 'Invalid name'
    if (!email) throw 'Invalid email'
    if (!password) throw 'Invalid password'
    query('insert into user (name, email, password) values (?, ?, sha1(?))', [name, email, password])
      .then(d => {
        if (!d) throw 'Error'
        res.status(201).json({ message: 'User created' })
      })
      .catch(e => log(e) || res.status(400).json({ message: e }))
  } catch (e) {
    log(e)
    res.status(400).json({ message: e })
  }
})

// todo

app.post('/todo/all', verifyJWT, (req, res) => {
  log('/todo/all')
  const user_id = req.user.id
  queryAll('select * from todo where user_id = ? order by favorite asc', [user_id])
    .then(d => res.status(200).json({ todos: d }))
    .catch(e => log(e) || res.status(400).json({ message: e }))
})

app.post('/todo/favorite', verifyJWT, (req, res) => {
  log('/todo/favorite')
  const user_id = req.user.id
  const { id } = req.body
  query('update todo set favorite = \'true\' where user_id = ? and id = ?', [user_id, id])
    .then(d => res.status(200).json({ message: 'Todo favorited' }))
    .catch(e => log(e) || res.status(400).json({ message: e }))
})

app.post('/todo/unfavorite', verifyJWT, (req, res) => {
  log('/todo/unfavorite')
  const user_id = req.user.id
  const { id } = req.body
  query('update todo set favorite = \'false\' where user_id = ? and id = ?', [user_id, id])
    .then(d => res.status(200).json({ message: 'Todo unfavorited' }))
    .catch(e => log(e) || res.status(400).json({ message: e }))
})

app.post('/todo/delete', verifyJWT, (req, res) => {
  log('/todo/delete')
  const user_id = req.user.id
  const { id } = req.body
  query('delete from todo where user_id = ? and id = ?', [user_id, id])
    .then(d => res.status(200).json({ message: 'Todo deleted' }))
    .catch(e => log(e) || res.status(400).json({ message: e }))
})

app.post('/todo/create', verifyJWT, (req, res) => {
  log('/todo/create')
  const user_id = req.user.id
  const { title, text } = req.body
  query('insert into todo (title, text, user_id) values (?, ?, ?)', [title, text, user_id])
    .then(d => res.status(201).json({ message: 'Todo created' }))
    .catch(e => log(e) || res.status(400).json({ message: e }))
})

app.listen(process.env.PORT, () => log(`Listening on port ${process.env.PORT}`))
