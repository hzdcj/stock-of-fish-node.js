var io = require('socket.io').listen(3000);
console.log('Server on port 3000.');
var hashName = new Array();
var fs = require("fs");
if (!fs.existsSync("databases")) {
    fs.mkdirSync("databases", function (err) {
        if (err) {
            console.log(err);
            return;
        }
    });
}
var mysql2=require('mysql');
var client = mysql2.createConnection({
    user: 'root',
    password: 'a782732548',
});
client.connect();
client.query('USE cocos');
io.sockets.on('connection', function (socket) {
    var ss = "";
    socket.emit('callConnect', ss);
    socket.on('create', function (data) {
        var str = eval("(" + data + ")");
        client.query(' CREATE TABLE IF NOT EXISTS CCC (id int PRIMARY KEY AUTO_INCREMENT,content varchar(255),flag int(5),farIp varchar(255))');
        var sql3 = 'INSERT INTO CCC(content,flag) VALUES(?,?)';
        var sql4 = [str.content,str.flag];
        client.query(sql3, sql4);
        socket.emit('createCallBack', 
           '登录成功');
    });
    socket.on('disconnect', function () {  
        delete client;
        
    }); 
    socket.on('reset', function (data) {
        console.log(data);
        var sql1 = 'update CCC set flag=1,farIp=null where content=?';
        var sql2 = [data];
        client.query(sql1, sql2);
        console.log("reset success");
    })
    socket.on('remove', function (data) {
        console.log(data);
        var sql7 = 'select content from CCC where farIp=?';
        var sql8 = [data];
        client.query(sql7, sql8, function (err, res) {
            console.log(res);
            if (res!= "")
            {
                var socketid = hashName[res[0].content];
                io.sockets.connected[socketid].emit('farDisconnect', res[0].content);
                //io.sockets.emit('farDisconnect', res[0].content);
            }

        });
        var sql5 = 'update CCC set flag=1,farIp=null where farIp=?'
        var sql6 = [data];
        client.query(sql5, sql6);
        var sql3 = 'delete from  CCC where content=?';
        var sql4 = [data];
        client.query(sql3, sql4);
        socket.send("clo");
        
    });
    socket.on('findAll', function (data) {
    	var sql3='select content from CCC where content<>? and flag=1 limit 1 ';
    	var sql4 = [data];
    	client.query(sql3,sql4,function(err,res)
    			{
    	    if (!err) {
    	        console.log(res);
    	        if (res != "")
    	        {
    	            console.log("data exit");
    	  
    	            var sql5 = 'update CCC set flag=0,farIp=? where content=?';
    	            var sql6 = [res[0].content, data];
    	            client.query(sql5,sql6);
    	            var sql7 = 'update CCC set flag=0,farIp=? where content=?';
    	            var sql8 = [data,res[0].content];	            
    	            client.query(sql7,sql8);
    	            io.sockets.emit('findAllCallBack', res[0].content);
    	            //socket.emit('findAllCallBack', res[0].content);
    	            //var socketid = hashName[res[0].content];
    	            //console.log(socket.id);
    	            //console.log(socketid);
    	            //io.sockets.connected[socketid].emit('findAllCallBack', data);
    	                       
    	        }
    	        else {
    	            console.log("data none");
    	            var str="";
    	            socket.emit('findAllCallBack', str);
    	        }
    	    }
    			});
    });
    socket.on('recordIp', function (data)
    {
        var ip = data;
        hashName[ip] = socket.id;
        console.log(hashName);
    })
    		
});