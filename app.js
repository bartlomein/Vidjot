const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const methodOverride = require("method-override");
const mongoose = require('mongoose');
const app = express();



//map global promise
mongoose.Promise = global.Promise;

//connect to mongoose


mongoose.connect('mongodb://localhost/vidjot-dev',{

}).then(() => console.log('mongodb connected')).catch(err => console.log('error'));

//Load IdeaModel

require('./models/idea');
const Idea = mongoose.model('ideas');

//Handlebars middleware

app.engine('handlebars', exphbs({ 
    defaultLayout: 'main' }));

app.set('view engine', 'handlebars');

//BODYPARSER
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

//method override
app.use(methodOverride("_method"));

//Index Route

app.get('/', (req, res) => {
    const title = 'welcome';
    res.render('index',{
        title:title
    });
});

//About Route

app.get("/about", (req, res) => {
  res.render('about');
});

//IDEA index page
app.get('/ideas', (req, res) => {
    Idea.find({})
    .sort({date:'descending'})
    .then(ideas =>{
        res.render('ideas/index', {
            ideas:ideas

        });
    });
    
})


//Add idea form
app.get("/ideas/add", (req, res) => {
    res.render('ideas/add');
});

//Edit Idea form 
app.get("/ideas/edit/:id", (req, res) => {
    Idea.findOne({
        _id: req.params.id
    })
    .then(idea => {
        res.render("ideas/edit", {
            idea:idea
        });
    })
    
});

//process form

app.post('/ideas', (req, res) =>{
    let errors = [];
    if(!req.body.title){
        errors.push({text:'Please add a title'});
    }
    if (!req.body.details) {
        errors.push({ text: 'Please add some details' });
    }
    if(errors.length > 0){
        res.render('ideas/add', {
            errors:errors,
            title:req.body.title, 
            details:req.body.details
        });
    }
    else{
        const newUser = {
            title: req.body.title,
            details: req.body.details
        }
        new Idea(newUser)
        .save()
        .then(idea=>{
            res.redirect('/ideas');
        })
    }
});

//Edit form process

app.put('/ideas/:id', (req, res) =>{
    Idea.findOne({
        _id:req.params.id
    })
    .then(idea => {
        //new values
        idea.title = req.body.title;
        idea.details = req.body.details;
        idea.save()
        .then(idea => {
            res.redirect('/ideas');
        })
    })
});


//DElete idea

app.delete('/ideas/:id', (req, res) =>{
    Idea.remove({
        _id: req.params.id
    })
    .then(()=>{
        res.redirect('/ideas');
    });
});



const port = 5000;

app.listen(port,() => {
    console.log(`Server started on port ${port}`);
})