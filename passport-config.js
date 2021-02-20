// want to use local - passport strategy
const LocalStrategy = require("passport-local").Strategy
const bcrypt = require('bcrypt')
// using that local strategy to initialize - > alos this is is the function in which we searilize and deserialize
function initialize(passport , getUserByEmail , getUserById){
    // to use local-streategy we first need to authenticate the user
    const authenticateUser = async(email , password , done) => {
        const user = getUserByEmail(email)
        if(user == null){
            return done(null , false , { message : "No user with that email"})
        }
        try{
            if(await bcrypt.compare(password , user.password)){
                return done(null , user)
            }else{
                return done(null , false , "Incorrect Password")
            }
        }catch(e){
            return done(e)
        }

    }
    passport.use(new LocalStrategy({ usernameField : 'email'} , 
    authenticateUser)) // default has been passed as param object

    passport.serializeUser((user , done) => done(null , user.id))
    passport.deserializeUser((id , done) => {
        return done(null , getUserById(id))
    })
}

module.exports = initialize