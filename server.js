// Load in environment variables and set them inside process.env
if(process.env.NODE_ENV != 'production') {
    require('dotenv').config()
}

//1 . Set up basic express app
const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const methodOverride = require('method-override')

// using passport.js
const initializePassport = require('./passport-config')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')

// using the initialize function that we made in passport-config.js
initializePassport(
    passport , 
    email => users.find(user => user.email === email),
    id => users.find(user => {
        return user.id === id
    })
)

// we will save the users in a variable in our server and not a db
const users = []

//2 . To tell express we are using ejs we need to set view-engine to ejs
// Now we can pass variables to index.ejs
app.set('view-engine' , 'ejs')

// we want to take email and pass from the forms and want to push them in req method inside our post method
// This is a mandatory step when dealing with forms with password
app.use(express.urlencoded({extended : false}))

// using flash to display success and error logging message
app.use(flash())
app.use(session({
    secret : process.env.SESSION_SECRET,
    resave : false,
    saveUninitialized : false
}))

// initialize passport and passport session to save the users across full session
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

// 3. set up route to -> homepage , login , register
app.get('/' , checkAuthenticated , (req , res) => {
    res.render('index.ejs' , { user : req.user.name}) // when you log in to homepage you are sent to index.ejs
})

app.get('/login' , checkNotAuthenticated ,(req , res) => {
    res.render('login.ejs')
})

// authintication settings using flash -> and redirect settings
app.post('/login' , checkNotAuthenticated, passport.authenticate('local' , {
    successRedirect : '/',
    failureRedirect : '/login',
    failureFlash : true // this flash has been set up in login.ejs
}))

app.get('/register' , checkNotAuthenticated , (req , res) => {
    res.render('register.ejs')
})

//4 . Form will post on the register
app.post('/register' , checkNotAuthenticated, async(req , res) => {
    try{
        const hashPassword = await bcrypt.hash(req.body.password , 10)
        users.push({
            id : Date.now().toString(),
            name : req.body.name,
            email : req.body.email,
            password : hashPassword
        })
        res.redirect('/login')
    }catch{
        res.redirect('/register')
    }
    console.log(users)
})

//create logout feature
app.delete('/logout' , (req , res) => {
    req.logOut() // given by passport
    res.redirect('/login')
})


// a middleware function which checks if the user is authenticated -> if not then it always redirects to the login page
function checkAuthenticated(req , res , next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect('/login')
}
// if a user is logged in they cannot go back to login page -> make sure using middleware
function checkNotAuthenticated(req , res , next){
    if(req.isAuthenticated()){
        return res.redirect('/')
    }
    next()
}
app.listen(3000)

 