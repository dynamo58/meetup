const PORT = process.env.PORT || 3001;

import express from "express";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import cors from "cors";

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
	cors: {
		origin: "*",
		methods: ["GET", "POST"]
	}
});

app.use(cors());

app.get("/", (req, res) => {
	res.send("xd");
});

io.on("connection", (socket) => {
	console.log(socket.id);
	socket.emit("connectRes", socket.id);

	socket.on("disconnect", () => {
		console.log("dc");

		socket.broadcast.emit("callEnded");
	});

	socket.on("callUser", ({ userToCall, signalData, from, name }) => {
		console.log("calluser");

		io.to(userToCall).emit("callUser", {
			signal: signalData,
			from, name
		});
	});

	socket.on("answerCall", (data) => {
		console.log("answercall");

		io.to(data.to).emit("callAccepted", data.signal);
	});
});

server.listen(PORT, () => {
	process.stdout.write(`Listening on ${PORT}\r\n`);
});

