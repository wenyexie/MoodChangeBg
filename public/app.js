const smallCups = document.querySelectorAll('.cup-small');
const liters = document.getElementById('liters');
const percentage = document.getElementById('percentage');
const remained = document.getElementById('remained');

//Mood Change the Backgrond
let mobilenet;
let classifier;
let video;
let results;
let sadClicks = 0;
let happyClicks = 0;

let body = document.getElementsByTagName('body')[0];
let rainAudio = document.getElementById("rain");
let cricketAudio = document.getElementById("crickets");
let buttonAudio = document.getElementById("buttonAudio");

function modelReady() {
    console.log('Model is ready!!!');
}

function videoReady() {
    console.log('Video is ready!!!');
}

function whileTraining(loss) {
    if (loss == null) {
        console.log('Training Complete');
        classifier.classify(gotResults);
    } else {
        console.log(loss);
    }
}

function gotResults(error, result) {
    if (error) {
        console.error(error);
    } else {
        results = result[0].label;
        classifier.classify(gotResults);

        if (results === "sad"){
            document.body.style.backgroundImage = "url('http://upload.wikimedia.org/wikipedia/commons/4/45/Rainy_day_in_Indianapolis.jpg')";
            body.setAttribute('class', 'weather rain');
            cricketAudio.pause();
            rainAudio.play();
        }

        if (results === "happy"){
            if (document.getElementsByClassName('weather').length) {
                body.classList.remove("weather");
                body.classList.remove("rain");
            }
            document.body.style.backgroundImage = "url('https://66.media.tumblr.com/5af3f8303456e376ceda1517553ba786/tumblr_o4986gakjh1qho82wo1_1280.jpg')";
            rainAudio.pause();
            cricketAudio.play();
        }

    }
}

function setup() {
    createCanvas(340, 270);
    video = createCapture(VIDEO);
    video.hide();
    background(0);
    mobilenet = ml5.featureExtractor('MobileNet', modelReady);
    classifier = mobilenet.classification(video, videoReady);

    document.getElementById('sad').onclick = function () {
        sadClicks += 1;
        document.getElementById('sad').innerHTML = " <i class=\"fas fa-sad-tear\"></i>" + "Sad images trained: " + sadClicks;
        classifier.addImage('sad');
    };
    document.getElementById('happy').onclick = function() {
        happyClicks += 1;
        document.getElementById('happy').innerHTML = " <i class=\"fas fa-smile\"></i>" + "Happy images trained: " + happyClicks;
        classifier.addImage('happy');
    };
    document.getElementById('train').onclick = function() {
        buttonAudio.play();
        document.getElementById('sad').innerHTML = " <i class=\"fas fa-sad-tear\"></i>" + "Sad";
        document.getElementById('happy').innerHTML = " <i class=\"fas fa-smile\"></i>" + "Happy";
        happyClicks = 0;
        sadClicks = 0;
        classifier.train(whileTraining);
    };
}

function draw() {
    push();
    translate(width,0);
    scale(-1, 1);
    image(video, 0, 0, 340, 270);
    pop();
}


window.addEventListener('load',()=>{
    document.getElementById('button-event').addEventListener('click',()=>{
     let noCups = document.getElementById('info').value;
     console.log(noCups);
    
     //creating the object
    let obj = {"number":noCups};
    
    //stringify the object
    let jsonData = JSON.stringify(obj);
    
    //fetch to route noCups
    fetch('/noCups',{
    method:'POST',
    headers:{
        "Content-type":"application/json"
    },
    body:jsonData
    })
    .then(response => response.json())
    .then(data => {console(data)});
     
    //1.make a fetch request of type POST so that we can send the(noCups) to the server
    
    })
    document.getElementById('get-tracker').addEventListener('click',()=> {
      
        //get info on ALL the CheckinInfo we have so far
        fetch('/getCups')
        .then(resp => resp.json())
        .then(data => {
            console.log(data.data);
            document.getElementById('checkin-info').innerHTML = '';
            
    for(let i=0;i<data.data.length;i++){
        let string = data.data[i].date + ":" +data.data[i].checkin;
        let elt = document.createElement('p');
       elt.innerHTML = string;
       document.getElementById('checkin-info').appendChild(elt);
    }
        })
    })
    })

    window.addEventListener('load', function () {

        //Open and connect socket
        let socket = io();

        //Listen for confirmation of connection
        socket.on('connect', function () {
            console.log("Connected");
        });
    
        /* --- Code to RECEIVE a socket message from the server --- */
        let chatBox = document.getElementById('chat-box-msgs');
    
        //Listen for messages named 'msg' from the server
        socket.on('msg', function (data) {
            console.log("Message arrived!");
            console.log(data);
    
            //Create a message string and page element
            let receivedMsg = data.name + ": " + data.msg;
            let msgEl = document.createElement('p');
            msgEl.innerHTML = receivedMsg;
    
            //Add the element with the message to the page
            chatBox.appendChild(msgEl);
            //Add a bit of auto scroll for the chat box
            chatBox.scrollTop = chatBox.scrollHeight;
        });
    
        /* --- Code to SEND a socket message to the Server --- */
        let nameInput = document.getElementById('name-input')
        let msgInput = document.getElementById('msg-input');
        let sendButton = document.getElementById('send-button');
    
        sendButton.addEventListener('click', function () {
            let curName = nameInput.value;
            let curMsg = msgInput.value;
            let msgObj = { "name": curName, "msg": curMsg };
     
            //Send the message object to the server
            socket.emit('msg', msgObj);
        });
    });




  