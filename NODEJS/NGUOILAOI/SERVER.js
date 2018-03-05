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
	var stranger_arr=[];
	var color_username= getRandomColor();

	var strangerid='';

	var side=Math.floor((Math.random() * 2) + 1);
	console.log(socket.id+ " vua ket noi");
	socket.on("client-send-username",function(data){
		if(user_online_arr.indexOf(data.username)>=0){

			socket.emit("server-send-login-failed");
			
		}
		else
		{
			var rand_ava=data.gender+Math.floor((Math.random()*5)+1);
			//Luu thong tin vao mang user_online_array
			user_online_arr.push({username:data.username,gender:rand_ava,id:socket.id,status:0});
			socket.username=data.username;
			//console.log(data.gender);
			socket.emit("server-send-username",{username:data.username,gender:rand_ava});
			 io.sockets.emit("server-send-userarr",user_online_arr);
			//Ket noi random 2 user (status=0 :dang cho, status =1 : dang chat)

			for(var i=0;i<user_online_arr.length;i++){
				if(user_online_arr[i].id!=socket.id&&user_online_arr[i].status==0)
				{
					//Trang  thai socket thanh 1
					user_online_arr[i].status=1;
					//Trang thai cua user thanh 1
					for(var j=0;j<user_online_arr.length;j++){
						if(user_online_arr[j].id==socket.id){
							user_online_arr[j].status=1;
							
						}
					}



					strangerid=user_online_arr[i].id;
					
					break;
				}
			}
			//Trương hop user dau tien se khong co strangerid
			if(strangerid!='')
			{
				socket.join(strangerid);
				io.sockets.in(strangerid).emit("server-send-stranger");	
			}
			
			 socket.on("user-send-mess",function(data){

			 	var currentdate = new Date().toLocaleString();
			 		//Trong truong hop user dau tien
			 		if(strangerid!='')
			 		{
			 			io.sockets.in(strangerid).emit("server-send-mess",{username:socket.username,mess:data,date:currentdate,s:side,color:color_username});
			 				
			 		}
			 		else
			 		{
			 			io.sockets.in(socket.id).emit("server-send-mess",{username:socket.username,mess:data,date:currentdate,s:side,color:color_username});
			 		}
				 	
				
			 });

		}
	});
	
	//Nguoi dung muon thay doi stranger
	socket.on("user-send-change",function(){
		if(strangerid!='')
		{
			io.sockets.in(strangerid).emit("user-send-disconnect");	
		}
		else
		{
			io.sockets.in(socket.id).emit("user-send-disconnect");
		}
		socket.leave(strangerid);


		for(var i=0;i<user_online_arr.length;i++)
		{

						

						if(user_online_arr[i].id==strangerid){
							user_online_arr[i].status=0;
						}
						if(user_online_arr[i].id==socket.id){
							user_online_arr[i].status=0;
						}

		}

		for(var i=0;i<user_online_arr.length;i++){
				if(user_online_arr[i].id!=socket.id&&user_online_arr[i].status==0)
				{
					//Trang  thai socket thanh 1
					user_online_arr[i].status=1;
					//Trang thai cua user thanh 1
					for(var j=0;j<user_online_arr.length;j++){
						if(user_online_arr[j].id==socket.id){
							user_online_arr[j].status=1;
							
						}
					}



					strangerid=user_online_arr[i].id;
					
					break;
				}
			}
			//Trương hop user dau tien se khong co strangerid
			if(strangerid!='')
			{
				socket.join(strangerid);
				io.sockets.in(strangerid).emit("server-send-stranger");	
			}
	});



	//Xoa userkhi disconnect
	socket.on("disconnect",function(){
		user_online_arr.splice(user_online_arr.indexOf(socket.username),1);
		io.sockets.emit("server-send-userarr",user_online_arr);
		//Gui thong bao nguoi la disconnect
		if(strangerid!='')
		{
			io.sockets.in(strangerid).emit("user-send-disconnect");	
		}
		else
		{
			io.sockets.in(socket.id).emit("user-send-disconnect");
		}
		socket.leave(strangerid);


		for(var i=0;i<user_online_arr.length;i++)
		{

						

						if(user_online_arr[i].id==strangerid){
							user_online_arr[i].status=0;
						}
						if(user_online_arr[i].id==socket.id){
							user_online_arr[i].status=0;
						}

		}

		// for(var i=0;i<user_online_arr.length;i++){
		// 		if(user_online_arr[i].id!=socket.id&&user_online_arr[i].status==0)
		// 		{
		// 			//Trang  thai socket thanh 1
		// 			user_online_arr[i].status=1;
		// 			//Trang thai cua user thanh 1
		// 			for(var j=0;j<user_online_arr.length;j++){
		// 				if(user_online_arr[j].id==socket.id){
		// 					user_online_arr[j].status=1;
							
		// 				}
		// 			}



		// 			strangerid=user_online_arr[i].id;
					
		// 			break;
		// 		}
		// 	}
		// 	//Trương hop user dau tien se khong co strangerid
		// 	if(strangerid!='')
		// 	{
		// 		socket.join(strangerid);
		// 		io.sockets.in(strangerid).emit("server-send-stranger");	
		// 	}
		

	});
});
	

  server.listen(process.env.PORT||8080);
 // server.listen(8080);
app.get("/",function(req,res){
	res.render("chatpage");
});
