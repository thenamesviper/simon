//TODO: fix upper divs detection area being off..thought it was the h1,
$(document).ready(startup);

let colorLoopInterval;
let totalCount;
let correctArray;

function startup() {
    setupStrictness();
    setupStart();
}

function setupStrictness() {
    
}

//happens initially and after reset clicked
function setupStart() {
    $(".start").removeClass("not-clickable");
    $("#start").on("click", function() {
        totalCount = 1;
        correctArray = generateRandomArray();
        $("#is-strict, #is-not-strict, #strict").addClass("strict-not-clickable");
        $(".start").addClass("not-clickable");
        $("#start").off("click");
        setupReset();
        startSequence();
    })
}

function setupReset() {
    $(".reset").removeClass("not-clickable");
    $("#reset p").text("Reset");
    $("#reset").on("click", function () {
        $(".reset").addClass("not-clickable");
        $("#is-strict, #is-not-strict, #strict").removeClass("strict-not-clickable");
        $("#reset").off("click");
        clearInterval(colorLoopInterval);
        setupStart();
    })
}

function generateRandomArray() {
    let colorArray = ["green", "red", "blue", "yellow"];
    let randomArray = [];
    for(let i = 0; i < 20; i++) {
        randomArray[i] = colorArray[Math.floor(Math.random() * 4)]
    }
    return randomArray;
}

function startSequence() {
    clearInterval(colorLoopInterval);
    console.log("startSequence count" + totalCount);
    loopColors(correctArray.slice(0, totalCount))
}

function loopColors(partialArray) {
    console.log(partialArray);
    let count = 1;
    $("#count").text(totalCount);
    
    //gives decent increasing difficulty  
    let delayTime = 400*Math.log(23-partialArray.length);
    
    colorLoopInterval = setInterval(function() {
        console.log("small count" + count);
        console.log("startloop count" + totalCount);
       disallowClick();
       wedgeSelected(partialArray[count-1], delayTime);
       if(count  == partialArray.length) {
            clearInterval(colorLoopInterval);
            //setTimeout makes sure wedge changes are over before activating
            setTimeout(function() {
                $(".wedge").attr("style", "");
                
                //empty array for player's answers
                awaitAnswers(partialArray, partialArray);
            }, delayTime);    
    } 
        count++;
        
    } , delayTime);
}


function wedgeSelected(value, delayTime) {
    let color = getColor(value);
    let wedgeSound = getSound(value); 
    
    //previous highlighting is undone immediately, then new highlighting after delay
    $(".wedge").attr("style", "");
    
    setTimeout(function() {
       $("#" + value).css("background-color", color);
       wedgeSound.play();
       }, delayTime/2);  
}

function getColor(color){
    let highlightedColors = 
        {green: "#33ff33", red: "red", blue: "blue", yellow: "yellow"}; 
    return highlightedColors[color];
}
function getSound(color){
    let sounds = {  green: "http://res.cloudinary.com/thenamesviper/video/upload/v1461050091/simonSound1_cc03vi.mp3",
                    red: "http://res.cloudinary.com/thenamesviper/video/upload/v1461050094/simonSound2_ssr5hf.mp3",
                    blue: "http://res.cloudinary.com/thenamesviper/video/upload/v1461050097/simonSound3_pf8hvo.mp3",
                    yellow: "http://res.cloudinary.com/thenamesviper/video/upload/v1461050099/simonSound4_pjva02.mp3",
                    invalid: "http://res.cloudinary.com/thenamesviper/video/upload/v1461109532/216090__richerlandtv__bad-beep-incorrect_blbffs.mp3"};
    let sound = new Audio(sounds[color]);
    return sound;
}

function awaitAnswers(gameArray, slicedArray) {
    clearInterval(colorLoopInterval);
    allowClick(gameArray, slicedArray);
    loopColors(gameArray);
}

function allowClick(gameArray, slicedArray) {
    setupReset();
    console.log("allowclickcount: " + totalCount);
    $(".wedge").on("click", function(evt) {
        //prevents bubbling up
        evt.stopImmediatePropagation();
        console.log($(this).attr("id") + " wedge clicked");
        clearInterval(colorLoopInterval);
        let correct = $(this).attr("id") == slicedArray[0] ? true : false;
        if(!correct) {
            clickEffects($(this).attr("id"), false);
            loopColors(gameArray);
        } else {
            clickEffects($(this).attr("id"), true);
            slicedArray = slicedArray.slice(1);
        }
        slicedArray.length != 0 ? awaitAnswers(gameArray, slicedArray) : sequenceComplete(gameArray);
    })
}

//stops unwanted behaviors during loop of correctArray in loopColors
function disallowClick(){
    $(".wedge").off("click");
    $("#reset").off("click");
    $(".reset").addClass("not-clickable");
    $("#reset p").text("Listen");
}

//flashes color and sound
function clickEffects(color, bool) {
    let whichColor = getColor(color);
    $("#" + color).css("background-color", whichColor);
    let sound = bool ? getSound(color) : getSound("invalid");
    sound.play();
    
    setTimeout(function() {
        $("#" + color).attr("style", "");
    }, 500);
}

function sequenceComplete(arr) {
    console.log("completedCount:" + totalCount);
    disallowClick();
    clearInterval(colorLoopInterval);
    totalCount ++;
    startSequence(correctArray);
}
