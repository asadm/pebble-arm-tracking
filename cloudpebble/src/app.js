//var BaseURL = "http://192.168.1.6:3000";
var BaseURLWS = "ws://192.168.1.3:8080";

var ws = new WebSocket(BaseURLWS);
ws.onmessage = function (event) {
//  console.log("msg");
//  console.log(event.data);
  if (event.data.indexOf("vibrate")>=0)
    Vibrate();
};


// Set callback for appmessage events
Pebble.addEventListener("appmessage",
                        function(e) {
                          //console.log("message");
                          //e.payload.time = new Date();
                          //console.log(JSON.stringify(e.payload));
                          //var RP = calcRollPitch(e.payload);
                          //e.payload.RollPitch=RP;
                          var data ={"sensors":ObjtoArray(e.payload)};
                          if (ws) ws.send(JSON.stringify(data));
                          //sendToServer(e.payload);
                        });

Pebble.addEventListener("ready",
                        function(e) {
                          console.log("connect! " + e.ready);
                          console.log(e.type);
                          //testServer();
                          
                        });


function ObjtoArray(obj){
  var count=0;
  for (i in obj) 
    count++;
  obj.length = count;
  return Array.prototype.slice.apply(obj);
}

function Vibrate(){
  var transactionId = Pebble.sendAppMessage( { "0": "vibrate" },
    function(e) {
      //console.log("Successfully delivered message with transactionId=" + e.data.transactionId);
        
    },
    function(e) {
//      console.log("Unable to deliver message with transactionId="       + e.data.transactionId);
  
        
    }
  );
  
}
