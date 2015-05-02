var axis = new THREE.Vector3(0.5,0.5,0);

var ws = new WebSocket("ws://"+location.host+":8080");
//standard broadcast method
ws.broadcast = function(data) {
  for (var i in this.clients)
    this.clients[i].send(data,function(){});
};


ws.onmessage = function (event) {
//  console.log("msg");
  //console.log(event.data);

  var data = JSON.parse(event.data);
  //console.log(data);
  if (data && data.sensors){
  	var rollPitchYaw = calcRollPitchYaw(data.sensors);
  	rotateCube(rollPitchYaw.roll,rollPitchYaw.yaw,rollPitchYaw.pitch);
    lastRollPitchYaw = rollPitchYaw;
    checkIfSpotMatched(rollPitchYaw);

    $('#rollpitchyawvals').text("Pitch:"+rollPitchYaw.pitch+ "\tRoll:"+rollPitchYaw.roll+ "\tYaw:"+rollPitchYaw.yaw+ "\t");
  }
  
};
var lastRollPitchYaw;
function calcRollPitchYaw(data){
  var X=data[0],Y=data[1],Z=data[2];
  var roll = ( Math.atan2(Y,Z)*180 )/Math.PI;
  var pitch = ( Math.atan2(X, Math.sqrt(Y*Y + Z*Z) )*180)   /Math.PI; 
  
  //console.log("Roll " + roll + "\tPitch " + pitch);
  return {roll:~~roll+180,pitch:~~pitch,yaw:data[3]};
}

function Vibrate(){
	ws.send('{"vibrate":"true"}');
}


/**/
var SavedSpots=[];
if (localStorage.SavedSpots)
  SavedSpots = JSON.parse(localStorage.SavedSpots);

$('#button_savespot').on('click',function(){
  var name = $('#hotspotname').val();
  $('#hotspotname').val('');
  if (!name || name.length==0) return;

  SavedSpots.push({name:name,data:lastRollPitchYaw});
  localStorage.SavedSpots = JSON.stringify(SavedSpots);
});


function distLessThan(a1,a2,threshold){
  return Math.abs(a1-a2)<threshold;
}

var ThresholdYaw = 20;
var ThresholdPitch = 30;
var ThresholdHit = 5;

var currentHitCount = 0;
var currentlyHit = false;
var currentObject;
var wideThresholdMode = false;
var startingRoll = 0;
function checkIfSpotMatched(data){
  var isHit = false;
  for (var i in SavedSpots){
    var curData = SavedSpots[i].data;
    //console.log("check",i,distLessThan(data.yaw,curData.yaw,ThresholdYaw),distLessThan(data.pitch,curData.pitch,ThresholdPitch));
    if ((distLessThan(data.yaw,curData.yaw,ThresholdYaw) && distLessThan(data.pitch,curData.pitch,ThresholdPitch)) ||
      (wideThresholdMode && distLessThan(data.yaw,curData.yaw,ThresholdYaw*2) && distLessThan(data.pitch,curData.pitch,ThresholdPitch*2)) ) {
      isHit=true;
      console.log("LOC",i,SavedSpots[i].name);
      
      if (currentHitCount<=ThresholdHit) currentHitCount++;  

      if (currentHitCount>ThresholdHit && !currentlyHit){

        console.log("HIT");
        Vibrate();
        currentlyHit = true;
        wideThresholdMode = true;
        startingRoll = data.roll;
        currentObject = i;
      }

      if (wideThresholdMode) { //in control mode

        console.log(SavedSpots[currentObject].value,data.roll-startingRoll,data.roll);
        $('#currentObject').show();
        $('#currentObject h2').text(SavedSpots[currentObject].name);
        if (!SavedSpots[currentObject].value || SavedSpots[currentObject].value<0) SavedSpots[currentObject].value = 0;
        SavedSpots[currentObject].value += isNaN(data.roll-startingRoll)?0:(data.roll-startingRoll)/4;
        if (SavedSpots[currentObject].value>100) SavedSpots[currentObject].value=100;

        var value = SavedSpots[currentObject].value;
        $('#currentObject #meterwidth').css({'width':value + "%"});
      }
      
    }
    
  }

  if (!isHit){
    currentHitCount--; if (currentHitCount<0) currentHitCount=0;
    currentlyHit = false;
    wideThresholdMode = false;
    $('#currentObject').hide();
  }

}

