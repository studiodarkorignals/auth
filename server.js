const cookieParser = require('cookie-parser')
const express = require('express')
const userModel = require('./models/users')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const app = express()
const path = require('path')
const port = 3000

app.set('view engine', 'ejs')
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))
app.use(cookieParser())

app.get('/', (req, res) => {
   res.render('index')
})
app.get('/checkRedirect', (req, res) => {
  if (req.cookies.token != '') {
    res.redirect('/dashboard')
  }
  else {
    res.redirect('/login')
  }
})
app.get('/login', (req, res) => {
  res.render('login')
})
app.get('/dashboard',async (req, res) => {
  let allUsers = await userModel.find()
  res.render('dashboard',{users:allUsers})
})
app.get('/signup', (req, res) => {
  res.render('signup')
})
app.get('/logout', (req, res) => {
  res.render('logout')
})
app.get('/error', (req, res) => {
  res.render('error')
})

app.post("/createACC", (req, res) => {
  let { username, email, password } = req.body
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, async (err, hash) => {
      let createdUser = await userModel.create({
        username,
        email,
        password: hash
      })
      let token = jwt.sign({ email }, "secretkey")
      res.cookie("token", token)
      res.redirect('/')
    })
  })
})

app.get("/logoutuser", (req, res) => {
  res.cookie('token', "")
  res.redirect('/')
})

app.post("/verify", async (req, res) => {
  let user = await userModel.findOne({ email: req.body.email })
  if (!user) {
    res.redirect('/error')
  }
  else {
    bcrypt.compare(req.body.password, user.password, (err, results) => {
      if(results){
      let token = jwt.sign({ email:user.email }, "secretkey")
      res.cookie("token", token)
      res.redirect('/')
      }
      else{
        res.redirect('/error')
      }
    })
  }
})



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})