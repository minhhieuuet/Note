var express=require("express");
var app=express();
app.use(express.static("public"));
app.set("view engine","ejs");
app.set("views","./views");

var server=require('http').Server(app);
var io=require('socket.io')(server);
var user_online_arr=[];
//Tao random color
function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}



io.on("connection",function(socket){
	var color_username= getRandomColor();
	console.log(socket.id+ " vua ket noi");
	socket.on("client-send-username",function(data){
		if(user_online_arr.indexOf(data)>=0){

			socket.emit("server-send-login-failed");
			
		}
		else
		{
			user_online_arr.push(data);
			socket.username=data;
			socket.emit("server-send-username",data);
			io.sockets.emit("server-send-userarr",user_online_arr);
			
		}
	});
	socket.on("user-send-mess",function(data){
				var currentdate = new Date().toLocaleString();
				io.sockets.emit("server-send-mess",{username:socket.username,mess:data,date:currentdate,s:1,color:color_username});
			});

	//Xoa userkhi disconnect
	socket.on("disconnect",function(){
		user_online_arr.splice(user_online_arr.indexOf(socket.username),1);
		io.sockets.emit("server-send-userarr",user_online_arr);
	});
});
	

server.listen(process.env.PORT||8080);
// server.listen(8080);
app.get("/",function(req,res){
	res.render("chatpage");
});
