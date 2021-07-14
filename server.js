const express = require('express');
// const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const Question = require('./models/question.js');
const User = require('./models/user.js');
const session = require('express-session');
const MongoDbSession = require('connect-mongodb-session')(session)


const server = express();

const dbURI = 'mongodb+srv://keerthi:mymongodbpassword@cloneoverflow.lwgep.mongodb.net/cloneoverflow?retryWrites=true&w=majority';

mongoose.connect(dbURI, {useNewUrlParser : true, useUnifiedTopology: true })
    .then((result) =>{
        console.log('connected to db')
        server.listen(5000);
    })
    .catch(err => console.log(err))




//register view engine
server.set('view engine', 'ejs');

//serving static files
server.use(express.static('public'))
server.use(express.urlencoded({ extended: true }))


//middleware for cookies
const store = new MongoDbSession({
    uri: dbURI,
    collection: "mySessions"
})


server.use(session({
    secret: "secret sign for cookie",
    resave: false,
    saveUninitialized: false,
    store: store
}))

const isAuth = (req, res, next) =>{
    if(req.session.isAuth){
        next();
    }
    else{
        res.redirect('/signup')
    }
}


//routes

//Home route
server.get('/', (req, res) =>{
    res.redirect('/signup')
})

//signup route
server.get('/signup', (req, res) =>{
    res.render('signup', { title: "Sign up" });
})



server.post('/signup', (req, res) =>{
   
    User.find({ username: req.body.username, password: req.body.password})
    .then((result) =>{
        if(result.length == 0){
            res.redirect('/');
        }
        else{
            req.session.isAuth = true;
            req.session.usrname = req.body.username;
            res.redirect('/questions')
        }
    })
    .catch(err => console.log(err))
})

// const getHash = async(pass) =>{
//     const newHash = await bcrypt.hash(pass, 22);

//     return newHash;
// }

server.get('/register', (req, res) =>{
    res.render('register', { title: "Register"})
})

server.post('/register', (req, res) =>{
    const { username, email, password } = req.body;
   
    User.findOne({ email: email, username: username, password: password})
    .then((result) =>{
        if(!result){
            console.log("new user");
            //create

            // const hashpsw = await getHash(password);

            const user = new User({
                username,
                email,
                password
            });

            user.save()
            .then(result =>{
                res.redirect('/signup')
            })
            .catch(err => console.log(err))
        }
        else{
            res.redirect('/register')
        }
    })
    .catch(err => console.log(err))
})


//questions route
server.get('/questions', isAuth, (req, res) =>{
    Question.find().sort({ createdAt: -1})
        .then((questions) =>{
            res.render('index', { title: "Home", questions, usrname: req.session.usrname});
        })
        .catch(err => console.log(err))
    
})

server.post('/questions', (req, res) =>{

    const body = req.body;
    body.answers = [];
    body.author = req.session.usrname;
    const newQuestion = new Question(body);
    
    newQuestion.save()
        .then((result) =>{
            res.redirect('/questions')
        })
        .catch(err => console.log(err))

})

server.get('/questions/create', isAuth, (req, res) =>{
    res.render('create', { title: "New Question" })
})

server.get('/questions/:id', isAuth, (req, res) =>{
    const id = req.params.id;

    Question.findById(id)
        .then((question) =>{
            res.render('details', { title: "Question details", question })
        })
        .catch(err => console.log(err))
})

server.post('/questions/:id', (req, res) =>{
    const id = req.params.id;
    const newAnswer = {
        content: req.body.body,
        author: req.session.usrname
    }

    Question.findOneAndUpdate({ _id: id }, {
        $push: {
            answers: newAnswer
        }
    }, { useFindAndModify: false })
    .then(result => {
        res.redirect('/questions')
    })
    .catch(err => console.log(err))
    
    
})

server.post('/logout', (req, res)=>{
    req.session.destroy((err) =>{
        if(err)console.log(err);

        res.redirect('/');
    })
})


//handling 404 requests
server.use((req, res) =>{
    res.render('404', { title: '404'})
})