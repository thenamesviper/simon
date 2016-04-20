//TODO: fix upper divs detection area being off..thought it was the h1,
//but working with it didn't help
// basic cleanup, use OOP in the future...

$(document).ready(startup);

let colorLoopInterval, repeatAfterWait;
let totalCount;
let correctArray;

function startup() {
    setupSources();
    setupStart();
}

function setupSources() {
   $("#sources").click(function() {
       $("#sources-popup").toggleClass("sources-hidden");
   })
}
//happens initially and after reset clicked
function setupStart() {
    $(".start").removeClass("not-clickable");
    $(".reset").addClass("not-clickable");
    $("#count").text("0");
    allowStrictChange();
    
    $("#start").on("click", function() {
        disallowStrictChange();
        totalCount = 1;
        correctArray = generateRandomArray();
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
        $("#winner").css("display", "none");
        $(".reset").addClass("not-clickable");
        $("#count").text("1");
        $("#reset").off("click");
        clearInterval(colorLoopInterval);
        setupStart();
    })
}
//two following functions and corresponding html/css should be cleaned up

//switches between two options visually, as well as having only one as "active"
//this class distinction is important when looking at failures in allowClick()
function allowStrictChange() {
    $("#is-strict, #is-not-strict, #strict").removeClass("strict-not-clickable");
    $("#is-strict, #is-not-strict").on("click", function() {
        if($(this).hasClass("active")) {
            $(".inactive").removeClass("inactive").addClass("active");
            $(this).removeClass("active").addClass("inactive");
        } else {
            $(".active").removeClass("active").addClass("inactive");
            $(this).removeClass("inactive").addClass("active");
        }
    })
}

function disallowStrictChange() {
    $("#is-strict, #is-not-strict").off("click");
    $("#is-strict, #is-not-strict, #strict").addClass("strict-not-clickable");
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
    loopColors(correctArray.slice(0, totalCount))
}

function loopColors(partialArray) {
    let count = 1;
    $("#count").text(totalCount);
    
    //gives decent increasing difficulty  
    let delayTime = 200*Math.log(23-partialArray.length);
    
    colorLoopInterval = setInterval(function() {
        
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
    
    //no input after 2 secs leads to repeat of sequence
    repeatAfterWait = setTimeout(function() {
        loopColors(gameArray)}
      , 2000)
}

function allowClick(gameArray, slicedArray) {
    setupReset();
    $(".wedge").on("click", function(evt) {
        
        //prevents bubbling up
        evt.stopImmediatePropagation();
        clearTimeout(repeatAfterWait);
        clearInterval(colorLoopInterval);
        let correct = $(this).attr("id") == slicedArray[0] ? true : false;
        if(!correct) {
            clickEffects($(this).attr("id"), false); 
            //strict mode results in restart w/ new array
            if($("#is-strict").hasClass("active")) {
                return setupStart();
            } else {
                loopColors(gameArray);
            }
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
    $("#reset p").text("Playing");
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
    disallowClick();
    clearInterval(colorLoopInterval);
    totalCount ++;
    totalCount == 21 ? endGame() : startSequence(correctArray); 
}

function endGame() {
    setTimeout(function() {
        let victorySound = new Audio("http://res.cloudinary.com/thenamesviper/video/upload/v1461188776/victory_zdggqx.mp3");
        victorySound.play();
        $("#winner").css("display", "initial");
        setupReset();
    },1000);
}
