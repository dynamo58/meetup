const PORT = process.env.PORT || 3001;

import express from "express";
import * as http from "http"
import { Server as SocketIOServer, Socket } from "socket.io";
import cors, {} from "cors";
import { v4 } from "uuid";

import { ISocketConnectResponse, ICallUserData, ICallUserResponse } from "./shared";

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
	cors: {
		origin: "*",
		methods: ["GET", "POST"]
	}
});

app.use(cors());

interface Room {
	participants: Socket[],
	owner: Socket[],
	name: string,
	uuid: string,
	password: string,
}

const _rooms = new Array<Room>();

io.on("connection", (socket) => {
	socket.emit("connectRes", {
		socketId: socket.id,
		uuid: v4(),
	} as ISocketConnectResponse);

	socket.on("disconnect", () => {
		socket.broadcast.emit("callEnded");
	});

	socket.on("callUser", ({ userToCall, signalData, from, name }: ICallUserData) => {
		io.to(userToCall).emit("callUser", {
			signal: signalData,
			from,
			name
		} as ICallUserResponse);
	});

	socket.on("answerCall", (data) => {
		io.to(data.to).emit("callAccepted", data.signal);
	});
});

server.listen(PORT, () => {
	process.stdout.write(`Listening on ${PORT}\r\n`);
});

