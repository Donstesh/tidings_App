const express  = require('express')
const mysql = require('mysql') 
const  bcrypt = require ('bcrypt') 
const  session = require('express-session') 


const app = express()
const connection = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'',
    database:'tidings'
})
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    
  }))

connection.query(
    'SELECT * FROM users',(error,results)=>{
        if(error) console.log(error)
        console.log('connected success')
    }
)

app.set('view engine','ejs')
app.use(express.static('public'))
app.use(express.urlencoded({extended:false}))

app.get('/',(req,res)=>{
    res.render('home')
})
app.get('/about', (req,res)=>{{
    res.render('about-us')
}})
app.get('/login',(req,res)=>{
    if(res.locals.isloggedIn){
        res.redirect('/about-us')
    }else{ 
        res.render('login',{error:false})
    }
   
})
app.post('/login',(req,res)=>{
    let email = req.body.email
    let password = req.body.password

    connection.query(
        'SELECT * FROM users WHERE email=?',[email],
        (error,results)=>{
            if(results.length>0){
                bcrypt.compare(password,results[0].password, (error,isEqual)=>{
                    if(isEqual){
                        
                        res.render('about-us')

                    }else{
                        let message = 'Email/password mismatch'
                        console.log('not equal')
                        res.render('login',{
                            error:true,
                            errorMessage:message,
                            email:email,
                            password:password
                        })
                    }
                })
                
            }else{
                let message = 'Account does not exist create one'
                res.render('login',{
                    error:true,
                    errorMessage:message,
                    email:email,
                    password:password
                })
            }
        }
    )
})
// app.get('/logout',(req,res)=>{
//     req.session.destroy((error)=>{
//         res.redirect('/')
//     })
// })
app.get('/signup',(req,res)=>{
    if(res.locals.isloggedIn){
        res.redirect('/home')
    }else{
        res.render('signup',{error:false})
    }
   
})
app.post('/signup',(req,res)=>{
    let email = req.body.email
    let fullname = req.body.fullname
    let gender = req.body.gender
    let password = req.body.password
    let confirmpassword = req.body.confirmpassword

    if(password===confirmpassword){
        bcrypt.hash(password,10,(error,hash)=>{
            
            connection.query(
                'SELECT email FROM users WHERE email =?',[email],
                (error,results)=>{
                    if(results.length === 0){
                        connection.query(
                            'INSERT INTO users(email,fullname,gender,password) VALUES(?,?,?,?)', 
                        [email,fullname,gender,hash],
                        (error,results)=>{
                            res.redirect('/login')
                        }   
                        )
                    }else{
                        let message = 'Email already Exists'
                        res.render('signup',{
                            error:true,
                            errorMessage:message,
                            email:email,
                            fullname:fullname,
                            gender:gender,
                            password:password,
                            confirmpassword:confirmpassword
                        })
                    }
                }
            )
        })
    }else{
        let message  = 'password & confirm password do not match '
        res.render('signup',{
            error:true,
            errorMessage:message,
            email:email,
            fullname:fullname,
            gender:gender,
            password:password,
            confirmpassword :confirmpassword
        })
        
    }

})
 


const PORT = process.env.PORT || 3000

app.listen(PORT, ()=>{
    console.log(`Server up on port ${PORT}`)
})