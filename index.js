let express = require('express');
let app = express();
app.use('/',express.static('public'));
let bodyParser = require('body-parser');
app.use(bodyParser.json());

// //DB initial code
// let Datastore =require('nedb');
// let db = new Datastore('check-in.db');
// db.loadDatabase();


// let checkinTracker = [];

// //add a route on server,that is listening for a post request
// app.post('/noCups',(req,res)=>{
//     console.log(req.body);
//     let currentDate = Date();
//     let obj = {
//         date:currentDate,
//         checkin:req.body.number
//     }
// //insert day data into the Database
//     db.insert(obj,(err,newDocs)=> {
//         //console.log('new document insert');
//         if(err) {
//             res.json({task:"task failed"});
            
//         } else {
//             res.json({task:"success"});
//         }
//         })
    
//     })


    //Initialize the actual HTTP server
    let http = require('http');
    let server = http.createServer(app);
    let port = process.env.PORT || 3000;
    server.listen(port, () => {
        console.log("Server listening at port: " + port);
    });
    


    // //add route to get ALL checkin track information
    // app.get('/getCups',(req,res)=> {
    //     db.find({},(err,docs)=>{
    //         if (err){
    //             res.json({task:"task failed"})
    //         }else{
    //         let obj = {data: docs};
    //         res.json(obj); 
    //         }
        
    //     })
      
    // })


    //Initialize socket.io
let io = require('socket.io')();
io.listen(server);

let output = io.of('/output');
let input = io.of('/input');
let quizNo = 0;

//Listen for individual clients/users to connect
io.sockets.on('connection', function(socket) {
    console.log("We have a new client: " + socket.id);

    //Listen for a message named 'msg' from this client
    socket.on('msg', function(data) {
        //Data can be numbers, strings, objects
        console.log("Received a 'msg' event");
        console.log(data);

        //Send a response to all clients, including this one
        io.sockets.emit('msg', data);

        //Send a response to all other clients, not including this one
        // socket.broadcast.emit('msg', data);

        //Send a response to just this client
        // socket.emit('msg', data);
    });

    //Listen for this client to disconnect
    socket.on('disconnect', function() {
        console.log("A client has disconnected: " + socket.id);
    });
});

//trivia questions
let quiz = [{
    question : "what is your 'Mood Climate'?",
    options : ["Sun", "Cloudy", "Fog","Rain"],
    answer : 0
}, {
    question : "What makes you Happy?",
    options : ["money", "friend", "food","fitness"],
    answer : 3
}, {
    question : "What makes you Sad?",
    options : ["fight", "rainy day", "lose sth important","I'm not ever sure anymore"],
    answer : 1
}];

//store the data about answers
let answer = {
    total : 0,
    right : 0,
    wrong : 0
}


output.on('connection', (socket) => {
    console.log('output socket connected !!!!!!! : ' + socket.id);

    socket.on('getquestion',()=> {
        answer.total = 0;
        answer.right = 0;
        answer.wrong = 0;
        console.log('output client has requested for a question');
        quizNo = Math.floor(Math.random()*quiz.length);
        //send the question + answer to the output client
        let outputdata = {
            question : quiz[quizNo].question,
            answer : quiz[quizNo].answer
        };
        output.emit('question', outputdata);
        //send the question + options  to the input client
        let inputdata = {
            question : quiz[quizNo].question,
            options : quiz[quizNo].options
        };
        input.emit('question', inputdata);
    })

    socket.on('getanswer', () => {
        output.emit('answers', answer);
    })
})

input.on('connection', (socket) => {
    console.log('input socket connected : ' + socket.id);

    //on receiving answer from the client
    socket.on('answer', (data) => {
        answer.total++;
        if(data.answer == quiz[quizNo].answer) {
            answer.right++;
            socket.emit('answer', {answer: true})
        } else {
            answer.wrong++;
            socket.emit('answer', {answer: false})
        }
    })

})

