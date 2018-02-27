var express=require("express");
var app=express();
app.use(express.static("public"));
app.set("view engine","ejs");
app.set("views","./views");

var server=require('http').Server(app);
var io=require('socket.io')(server);
var user_online_arr=["hi"]; 

io.on("connection",function(socket){
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
});

server.listen(process.env.PORT ||8080);

app.get("/",function(req,res){
	res.render("chatpage");
});
