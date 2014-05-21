var util = require('util'), fs = require('fs');
var sio = require('socket.io');
var server = require('http').createServer(handler);

server.listen(8100);
console.log("Rodando na portal 8100");

function handler(req, resp)
{
	console.log(__dirname + "/index.html");

	fs.readFile(__dirname + '/index.html', function(err, data){

		if(err){
			resp.writeHead(500);
			return resp.end("Erro na abertura do arquivo index.html " + err);
		}


		resp.writeHead(200, {"Content-Type" : "text/html"});
		resp.end(data);



	});
}


var mensagens = [];

function armazenarMensagem(nick, mensagem)
{
	var msg = {
		nick: nick,
		texto: mensagem,
		hora: new Date().toLocaleTimeString()
	}

	mensagens.push(msg);

	if(mensagens.lenght > 5){
		mensagens.splice(0,1);
	}

	return msg;
}


function enviarMensagens(client)
{
	mensagens.forEach(function(msg){
		client.emit('mensagem', msg);
	});

}

var io = sio.listen(server);

io.sockets.on('connection', function(socket){
	console.log('Cliente Conectou '+ socket.id);

	socket.on('set nick', function(nick){
		socket.broadcast.emit('conectou', nick, socket.id);// Broadast direciona só para quem conectou, no caso o socket.id

		socket.set('nick', nick); // Setando um atributo, nick

		enviarMensagens(socket);

	});


	socket.on('boas vindas', function(sid){
		socket.get('nick', function(err, nick){
			io.sockets.socket(sid).emit('Boas vindas', nick); // emit o evento para um id

		});
	});

	socket.on('enviar mensagem', function(mensagem){
		console.log('chegou mensagem' + mensagem);

		socket.get('nick', function(err, nick){
			var msg = armazenarMensagem(nick, mensagem);
			io.sockets.emit('mensagem', msg);
		});

	});

});