// Copyright 101Computing.net 
var zoom = 1;
var logMode=false;
function applyZoom(x) {
if ((x>0) && (zoom<1.4)) {
   zoom+=0.1; document.getElementById('enigmaZoom').style.zoom = zoom;
} 
if ((x<0) && (zoom>0.5)) {
   zoom-=0.1; document.getElementById('enigmaZoom').style.zoom = zoom;
}
}

var sound = true;
var mode = "Encrypt";
//Rotors - https://en.wikipedia.org/wiki/Enigma_rotor_details
var rotor1 = "EKMFLGDQVZNTOWYHXUSPAIBRCJ";
var rotor1Trigger = "Q"; //Notch Position
var rotor2 = "AJDKSIRUXBLHWTMCQGZNPYFVOE";
var rotor2Trigger = "E"; //Notch Position
var rotor3 = "BDFHJLCPRTXVZNYEIWGAKMUSQO";
var rotor3Trigger = "V"; //Notch Position
var rotor4 = "ESOVPZJAYQUIRHXLNFTGKDCMWB";
var rotor4Trigger = "J"; //Notch Position
var rotor5 = "VZBRGITYUPSDNHLXAWMJQOFECK";
var rotor5Trigger = "Z"; //Notch Position
var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

var rotorANotch=false;
var rotorBNotch=false;
var rotorCNotch=false;
var letterCount = 0;

//(AY) (BR) (CU) (DH) (EQ) (FS) (GL) (IP) (JX) (KN) (MO) (TZ) (VW)
var reflectorB = {"A":"Y","Y":"A","B":"R","R":"B","C":"U","U":"C","D":"H","H":"D","E":"Q","Q":"E","F":"S","S":"F","G":"L","L":"G","I":"P","P":"I","J":"X","X":"J","K":"N","N":"K","M":"O","O":"M","T":"Z","Z":"T","V":"W","W":"V"};

var reflectorC = {"A":"F","F":"A","B":"V","V":"B","C":"P","P":"C","D":"J","J":"D","E":"I","I":"E","G":"O","O":"G","H":"Y","Y":"H","K":"R","R":"K","L":"Z","Z":"L","M":"X","X":"M","N":"W","W":"N","Q":"T","T":"Q","S":"U","U":"S"};

var reflector = reflectorB;
var reflectorName = "UKW-B";

//var reflectorb = "YRUHQSLDPXNGOKMIEBFZCWVJAT" //b M3
//var reflectorc = "FVPJIAOYEDRZXWGCTKUQSBNMHL"; //c M3

var rotorA = rotor1;
var rotorB = rotor2;
var rotorC = rotor3;
var rotorATrigger = rotor1Trigger;
var rotorBTrigger = rotor2Trigger;
var rotorCTrigger = rotor3Trigger;

var colors = {"red":0,"yellow":0,"blue":0,"green":0,"magenta":0,"cyan":0,"orangered":0,"maroon":0,"indigo":0,"olive":0,"sienna":0,"lime":0,"teal":0};
           
var currentColor = "";
var currentLetter = "";

function getFreeColor() {
 for(var key in colors) {
    if (colors[key]==0) return key;
   }
}
             
var plugs = {};
plugs["Q"] = "";
plugs["W"] = "";
plugs["E"] = "";
plugs["R"] = "";
plugs["T"] = "";
plugs["Z"] = "";
plugs["U"] = "";
plugs["I"] = "";
plugs["O"] = "";
plugs["A"] = "";
plugs["S"] = "";
plugs["D"] = "";
plugs["F"] = "";
plugs["G"] = "";
plugs["H"] = "";
plugs["J"] = "";
plugs["K"] = "";
plugs["P"] = "";
plugs["Y"] = "";
plugs["X"] = "";
plugs["C"] = "";
plugs["V"] = "";
plugs["B"] = "";
plugs["N"] = "";
plugs["M"] = "";
plugs["L"] = "";

function resetPlug(color) {
 var elements = document.getElementsByClassName("plug");
 for(var i = 0; i < elements.length; i++) {
  if (elements.item(i).style.background==color) {
    elements.item(i).style.background ="";
  }
  } 
  colors[color]=0;
}

function plug(element) {
 letter = element.innerText;
 if (sound) {
   var plugboardSound = new Audio('./sounds/plugboard.mp3');
   plugboardSound.play();
 }
 
 if (element.style.background == "") {
   if (currentColor=="") {
     currentColor = getFreeColor()
     element.style.background = currentColor;
     currentLetter = letter;
   } else {
       plugs[letter]=currentLetter;
       plugs[currentLetter]=letter;
       currentLetter="";
   
     element.style.background = currentColor;
     colors[currentColor] = 2;
     currentColor = "";
     currentLetter = "";
   }
 } else {
  if (element.style.background ==currentColor) {
   resetPlug(element.style.background);
   currentColor="";
  }else{
   colors[element.style.background] = 0;
   tmp = plugs[letter]; 
   plugs[letter]  = "";
   if (tmp!="") plugs[tmp]="";
   resetPlug(element.style.background);
   element.style.background = "";
 }
 }
 
}

function showLog() {
  if (logMode==true) {
    logMode = false;
   document.getElementById("log").style.display="none";
  } else {
  logMode = true;
  document.getElementById("log").style.display="block";
  }
}

function log(txt) {
if (logMode==true) document.getElementById("log").innerHTML = document.getElementById("log").innerHTML + txt + "<br/>"; 
}

function clearLog() {
document.getElementById("log").innerHTML = "<H1>Encryption Steps:</H1>"; 
}
function encryptKey(letter) {
 var plaintext = document.getElementById("plaintext");
 var ciphertext = document.getElementById("ciphertext");
 var keyboardSound = new Audio('./sounds/keyboard.mp3');
 keyboardSound.play();
 plaintext.innerHTML = plaintext.innerHTML + letter;
 
 var encryptedLetter = letter;

 log("Keyboard Input: " + letter);
 //Rotate Rotors // This happens as soon as a key is pressed, before encrypting the letter!
 //Third rotor rotate by 1 for every key being pressed
 var rotorCLetter = document.getElementById("rotor3Current").innerText;
 if (rotorCLetter == rotorCTrigger) rotorCNotch = true;  
 var previous = alphabet.indexOf(rotorCLetter);
 var current = (previous + 1) % 26;
 var next = (previous + 2) % 26;
 
 document.getElementById("rotor3Previous").innerText = rotorCLetter;
 rotorCLetter = alphabet.charAt(current);
 document.getElementById("rotor3Current").innerText = rotorCLetter;
 document.getElementById("rotor3Next").innerText = alphabet.charAt(next);
 
 //Check if rotorB needs to rotate
 if (rotorCNotch) {
 rotorCNotch=false;
 var rotorBLetter = document.getElementById("rotor2Current").innerText;
 if (rotorBLetter == rotorBTrigger) rotorBNotch = true; 
   previous = alphabet.indexOf(rotorBLetter);
   current = (previous + 1) % 26;
   next = (previous + 2) % 26;
   document.getElementById("rotor2Previous").innerText = rotorBLetter;
   rotorBLetter = alphabet.charAt(current);
   document.getElementById("rotor2Current").innerText = rotorBLetter;
   document.getElementById("rotor2Next").innerText = alphabet.charAt(next);
   //Check if rotorA needs to rotate
    if (rotorBNotch) {
        rotorBNotch=false;
        var rotorALetter = document.getElementById("rotor1Current").innerText;
     
        previous = alphabet.indexOf(rotorALetter);
        current = (previous + 1) % 26;
        next = (previous + 2) % 26;
        document.getElementById("rotor1Previous").innerText = rotorALetter;
        document.getElementById("rotor1Current").innerText = alphabet.charAt(current);
        document.getElementById("rotor1Next").innerText = alphabet.charAt(next);
     }
     
 } else {
       //Check for double step sequence!
       rotorBLetter = document.getElementById("rotor2Current").innerText;
       if ( rotorBLetter == rotorBTrigger) { 
       
       previous = alphabet.indexOf(rotorBLetter);
       current = (previous + 1) % 26;
       next = (previous + 2) % 26;
       document.getElementById("rotor2Previous").innerText = rotorBLetter;
       rotorBLetter = alphabet.charAt(current);
       document.getElementById("rotor2Current").innerText = rotorBLetter;
       document.getElementById("rotor2Next").innerText = alphabet.charAt(next);
       
       
       
       var rotorALetter = document.getElementById("rotor1Current").innerText;
     
        previous = alphabet.indexOf(rotorALetter);
        current = (previous + 1) % 26;
        next = (previous + 2) % 26;
        document.getElementById("rotor1Previous").innerText = rotorALetter;
        document.getElementById("rotor1Current").innerText = alphabet.charAt(current);
        document.getElementById("rotor1Next").innerText = alphabet.charAt(next);
 }
 }
 log("Rotors Position: " + document.getElementById("rotor1Current").innerText + document.getElementById("rotor2Current").innerText + document.getElementById("rotor3Current").innerText);
 
 
 //Implement plugboard encryption!
 if (plugs[letter]!="") encryptedLetter = plugs[letter];
 log("Plugboard Encryption: " + encryptedLetter);
 
 //Rotors & Reflector Encryption
 
 var offset3Letter = document.getElementById("rotor3Current").innerText;
 var offset3 = alphabet.indexOf(offset3Letter);
 var offset2Letter = document.getElementById("rotor2Current").innerText;
 var offset2 = alphabet.indexOf(offset2Letter);
 var offset1Letter = document.getElementById("rotor1Current").innerText;
 var offset1 = alphabet.indexOf(offset1Letter);
 
 letterCount++;
 //Wheel3
 var pos = alphabet.indexOf(encryptedLetter);
 var let = rotorC.charAt((pos + offset3)%26);  
 pos = alphabet.indexOf(let);
 encryptedLetter = alphabet.charAt((pos - offset3 +26)%26);
 log("Wheel 3 Encryption: " + encryptedLetter);
 
 //Wheel2
 pos = alphabet.indexOf(encryptedLetter);
 let = rotorB.charAt((pos + offset2)%26);  
 pos = alphabet.indexOf(let);
 encryptedLetter = alphabet.charAt((pos - offset2 +26)%26); 
 log("Wheel 2 Encryption: " + encryptedLetter);
 
 //Wheel1
 pos = alphabet.indexOf(encryptedLetter);
 let = rotorA.charAt((pos + offset1)%26);  
 pos = alphabet.indexOf(let);
 encryptedLetter = alphabet.charAt((pos - offset1 +26)%26); 
 log("Wheel 1 Encryption: " + encryptedLetter); 
 
 //reflector
 if (encryptedLetter in reflector) encryptedLetter = reflector[encryptedLetter];
 log("Reflector Encryption: " + encryptedLetter);
 //Back through the rotors 
 //Wheel1  
 pos = alphabet.indexOf(encryptedLetter);
 let = alphabet.charAt((pos + offset1)%26);  
 pos = rotorA.indexOf(let);
 encryptedLetter = alphabet.charAt((pos - offset1 +26)%26); 
 log("Wheel 1 Encryption: " + encryptedLetter);
 
 //Wheel2
 pos = alphabet.indexOf(encryptedLetter);
 let = alphabet.charAt((pos + offset2)%26);       
 pos = rotorB.indexOf(let);
 encryptedLetter = alphabet.charAt((pos - offset2 +26)%26); 
 log("Wheel 2 Encryption: " + encryptedLetter);
 
 //Wheel3
 pos = alphabet.indexOf(encryptedLetter);
 let = alphabet.charAt((pos + offset3)%26);      
 pos = rotorC.indexOf(let);
 encryptedLetter = alphabet.charAt((pos - offset3 + 26)%26); 
 log("Wheel 3 Encryption: " + encryptedLetter);
 
 
 //Implement plugboard encryption!
 if (plugs[encryptedLetter]!="") encryptedLetter = plugs[encryptedLetter];
 log("Plugboard Encryption: " + encryptedLetter);
 
 log("Output (Lampboard): " + encryptedLetter);
 log("-----------------------------")
 
 
 ciphertext.innerHTML = ciphertext.innerHTML + encryptedLetter;
 if ((letterCount%5)==0) {
   ciphertext.innerHTML = ciphertext.innerHTML + " ";
   plaintext.innerHTML = plaintext.innerHTML + " ";
 }
 lightOn(encryptedLetter);
}

function lightOn(letter) {
 //turn all the lights off
 var elements = document.getElementsByClassName("lightOn");
 for (var i = 0; i < elements.length; i++) elements.item(i).className = "light";
   
 document.getElementById("light"+letter).className="lightOn";
 setTimeout(function(){       document.getElementById("light"+letter).className="light"; }, 800);
}

function keyOn(letter) {
 document.getElementById("key"+letter).className="keyOn";
 setTimeout(function(){       document.getElementById("key"+letter).className="key"; }, 500);
}

function pressKey(key) {
   var letter = key.innerText;
   encryptKey(letter);
}
document.addEventListener("keypress", checkKey);

function checkKey() {
var charCode = event.which || event.keyCode;
var char  = String.fromCharCode(charCode); 
char = char.toUpperCase();
//Only accept letters from the alphabet!
if (alphabet.includes(char)) {
  encryptKey(char);
  keyOn(char);
  //} else {
  //var plaintext = document.getElementById("plaintext");
  //var ciphertext = document.getElementById("ciphertext");
  //plaintext.innerHTML = plaintext.innerHTML + char;
  //ciphertext.innerHTML = ciphertext.innerHTML + char;
}
}
function nextRotor(rotor) {
   event.stopPropagation();
   var wheelSound = new Audio('./sounds/wheel.mp3');
   wheelSound.play();
   var rotorLetter = document.getElementById("rotor" +rotor+ "Current").innerText;
   var previous = alphabet.indexOf(rotorLetter);
   var current = (previous + 1) % 26;
   var next = (previous + 2) % 26;
   document.getElementById("rotor" +rotor+ "Previous").innerText = rotorLetter;
   document.getElementById("rotor" +rotor+ "Current").innerText = alphabet.charAt(current);
   document.getElementById("rotor" +rotor+ "Next").innerText = alphabet.charAt(next);
}
function previousRotor(rotor) {
   event.stopPropagation();
   var audio = new Audio('./sounds/wheel.mp3');
   audio.play();
   var rotorLetter = document.getElementById("rotor" +rotor+ "Current").innerText;
   var next = alphabet.indexOf(rotorLetter);
   var current = (next + 25) % 26;
   var previous = (next + 24) % 26;
   document.getElementById("rotor" +rotor+ "Previous").innerText = alphabet.charAt(previous);
   document.getElementById("rotor" +rotor+ "Current").innerText = alphabet.charAt(current);
   document.getElementById("rotor" +rotor+ "Next").innerText = rotorLetter;
}


function displayRotorSettings() {
document.getElementById("rotor1Position").value = document.getElementById("rotor1Current").innerText;
document.getElementById("rotor2Position").value = document.getElementById("rotor2Current").innerText;
document.getElementById("rotor3Position").value = document.getElementById("rotor3Current").innerText;
document.getElementById("rotorSettings").style.display="block";
}

function cancelSettings() {
 document.getElementById("rotorSettings").style.display="none";
}

function caesarShift(str, amount) {
   var output = '';

   for (var i = 0; i < str.length; i ++) {
       var c = str[i];
       var code = str.charCodeAt(i);
       if ((code >= 65) && (code <= 90))
           c = String.fromCharCode(((code - 65 + amount) % 26) + 65);
       output += c;
   }
   return output;
}

function applySettings() {
var r = document.getElementById("reflector").value;
if (r=="UKW-B") {
   reflector = reflectorB;
} else {
   reflector = reflectorC;
}

 r = document.getElementById("rotor1Select").value;
 switch(r) {
   case "I": rotorA=rotor1; rotorATrigger = rotor1Trigger; break;
   case "II": rotorA=rotor2; rotorATrigger = rotor2Trigger; break;
   case "III": rotorA=rotor3; rotorATrigger = rotor3Trigger; break;
   case "IV": rotorA=rotor4; rotorATrigger = rotor4Trigger; break;
   case "V": rotorA=rotor5; rotorATrigger = rotor5Trigger; break;
 } 
 r = document.getElementById("rotor2Select").value;
   switch(r) {
   case "I": rotorB=rotor1; rotorBTrigger = rotor1Trigger; break;
   case "II": rotorB=rotor2; rotorBTrigger = rotor2Trigger; break;
   case "III": rotorB=rotor3; rotorBTrigger = rotor3Trigger; break;
   case "IV": rotorB=rotor4; rotorBTrigger = rotor4Trigger; break;
   case "V": rotorB=rotor5; rotorBTrigger = rotor5Trigger; break;
 } 
 r = document.getElementById("rotor3Select").value;
   switch(r) {
   case "I": rotorC=rotor1; rotorCTrigger = rotor1Trigger; break;
   case "II": rotorC=rotor2; rotorCTrigger = rotor2Trigger; break;
   case "III": rotorC=rotor3; rotorCTrigger = rotor3Trigger; break;
   case "IV": rotorC=rotor4; rotorCTrigger = rotor4Trigger; break;
   case "V": rotorC=rotor5; rotorCTrigger = rotor5Trigger; break;
 }
 
 var rotor3Setting = document.getElementById("rotor3Setting").value;
 var offset3Setting = alphabet.indexOf(rotor3Setting);
 var rotor2Setting = document.getElementById("rotor2Setting").value;
 var offset2Setting = alphabet.indexOf(rotor2Setting);
 var rotor1Setting = document.getElementById("rotor1Setting").value;
 var offset1Setting = alphabet.indexOf(rotor1Setting);

 rotorA = caesarShift(rotorA,offset1Setting);
 rotorB = caesarShift(rotorB,offset2Setting);
 rotorC = caesarShift(rotorC,offset3Setting);
 
 if (offset1Setting>0) rotorA = rotorA.substring(26-offset1Setting) + rotorA.substring(0,26-offset1Setting);
 if (offset2Setting>0) rotorB = rotorB.substring(26-offset2Setting) + rotorB.substring(0,26-offset2Setting);
 if (offset3Setting>0) rotorC = rotorC.substring(26-offset3Setting) + rotorC.substring(0,26-offset3Setting);

 var rotorALetter = document.getElementById("rotor1Position").value;
 var rotorBLetter = document.getElementById("rotor2Position").value;
 var rotorCLetter = document.getElementById("rotor3Position").value;
 
 document.getElementById("rotor1Current").innerText = rotorALetter;
 document.getElementById("rotor2Current").innerText = rotorBLetter;
 document.getElementById("rotor3Current").innerText = rotorCLetter;
 
 var current = alphabet.indexOf(rotorALetter);
 var previous = (current + 25) % 26;
 var next = (current + 1) % 26;
 document.getElementById("rotor1Previous").innerText = alphabet.charAt(previous);
 document.getElementById("rotor1Next").innerText = alphabet.charAt(next);
 
 current = alphabet.indexOf(rotorBLetter);
 previous = (current + 25) % 26;
 next = (current + 1) % 26;
 document.getElementById("rotor2Previous").innerText = alphabet.charAt(previous);
 document.getElementById("rotor2Next").innerText = alphabet.charAt(next);
 
 current = alphabet.indexOf(rotorCLetter);
 previous = (current + 25) % 26;
 next = (current + 1) % 26;
 document.getElementById("rotor3Previous").innerText = alphabet.charAt(previous);
 document.getElementById("rotor3Next").innerText = alphabet.charAt(next);
 
 document.getElementById("rotorSettings").style.display="none";
}

function clearText() {
 if (mode=="Encrypt") {
 document.getElementById("plaintext").innerHTML="<H1>Plaintext:</H1>";
 document.getElementById("ciphertext").innerHTML="<H1>Ciphertext:</H1>";
 } else {
 document.getElementById("plaintext").innerHTML="<H1>Ciphertext:</H1>";
 document.getElementById("ciphertext").innerHTML="<H1>Plaintext:</H1>"; 
 } 
 letterCount =0;
 clearLog();
}

function encrypt() {
 mode="Encrypt";
 document.getElementById("enigma-book").className="page1";
 clearText();
}

function decrypt() {
 mode="Decrypt";
 document.getElementById("enigma-book").className="page2";
 clearText();
}

function enigmaWindow() {
window.open("./enigma-M3.html",'_blank','toolbar=no, menubar=no, location=no, resizable=yes, addressbar=no,  width=800, height=600');
}
function enigmaInstructions() {
window.open("./enigma-instructions.html",'_blank','toolbar=no, menubar=no, location=no, resizable=yes, addressbar=no,  width=860, height=600');
}