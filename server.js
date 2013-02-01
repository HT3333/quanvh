var io = require('socket.io').listen(8000);
var clientList = [];

io.sockets.on('connection', function (socket) {
   clientList.push(socket);
   // listen for the chat even. and will recieve
   // data from the sender.
   socket.on('chat', function (data) {
   
      // default value of the name of the sender.
      var sender = 'unregistered';
      
      // get the name of the sender
      socket.get('nickname', function (err, name) {
         console.log('Chat message by ', name);
         console.log('error ', err);
  		sender = name;
      });   

      // broadcast data recieved from the sender
      // to others who are connected, but not 
      // from the original sender.
		/*
		socket.broadcast.emit('chat', {
         msg : data, 
         msgr : sender
      });
	  */
	  
	  
	  //send data to browser, specific data with sender
	  
	  for(var i=0; i < clientList.length; i++) {
			if(socket != clientList[i]) {
			  clientList[i].emit('chat',{
				msg : data,
				msgr : sender
			  });
			}
			else{
				clientList[i].emit('chat',{
				msg: data,
				msgr : "Me"
				});
			}
		}
		
		
		//socket.broadcast.emit('chat',data);
   });
   

   // register nickname for each socket
   socket.on('register', function (name) {
      socket.set('nickname', name, function () {
		/*
         // this kind of emit will send to all!
		 io.sockets.emit('chat', {
            msg : "hello " + name + '!', 
            msgr : "mr. server"
         });
		 //io.sockets.emit('chat',name);
		 */
		 //send to all browser with different data
		 for(var i=0;i<clientList.length;i+=1) {
			if(socket != clientList[i]) {
			  clientList[i].emit('chat',{
				msg : "Client " +name+ " has joined room!",
				msgr : "Server"
			  });
			}
			else{
				clientList[i].emit('chat',{
				msg: "hello " +name+ "!",
				msgr : "Server"
				});
			}
		}
		
      });
   });
	//dicconect socket
   socket.on('disconnect',function(){
	var socketName = 'unregistered';
	  socket.get('nickname', function (err, name) {
         console.log('Chat message by ', name);
         console.log('error ', err);
         socketName = name;
      });
   
	//delete socket on list of senders
	for(var i = 0; i < clientList.length; i++){
		if(socket == clientList[i]){
		console.log(socketName+" disconnect");
			for( var k = i; k < clientList.length-1; k++){
				clientList[k] = clientList[k+1];
			}
			clientList.pop();
			break;
		}
	}
	
	//communicate to other clients
	for(var i = 0; i < clientList.length; i++){
		clientList[i].emit('chat',{
				msg : "Client " +socketName+ " has left room!",
				msgr : "Server"
			  });
	}
	
   });
});
