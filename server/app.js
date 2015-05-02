/*
This tiny server does two things.
1. Opens fileserver on port 80 to serve html files. 
2. Opens WebSocket server on port 8080 to receive and broadcast msgs between PebbleJs and Web Client running on PC.

*/


//=====FILE SERVER PART=====//
var express = require('express'),
    http = require('http'),
    app = express();

app.set('port', 80);		

app.get('/*', function(req, res, next) {

    //This is the current file they have requested
    var file = req.params[0];
    res.sendFile(__dirname + '/public/' + file);

}); //app.get *



http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});


//=====WEBSOCKET PART=====//
var WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({
        port: 8080
    });

wss.on('connection', function(ws) {
    ws.on('message', function(message) {
    	//On new message, just broadcast this message to every client
        console.log('received: %s', message);
        wss.broadcast(message);
    });
    ws.on('error', function(err){
        //console.log(err);
    });
    ws.send('{"msg":"WebSocket Tested"}', function(error) {
    	//console.log(error);
    });
    console.log("New Connection");
});

//standard broadcast method
wss.broadcast = function(data) {
  for (var i in this.clients)
    this.clients[i].send(data,function(){});
};
