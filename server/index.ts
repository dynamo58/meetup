const PORT = process.env.PORT || 3001;

import express from "express";
import * as http from "http"
import { Server as SocketIOServer, Socket } from "socket.io";
import cors, {} from "cors";
import { v4 } from "uuid";


import {
	UUID,
	ISocketConnectResponse,
	IUserDisconnectedData,
	IMakeRoomData,
	IMakeRoomResponse,
	IDeleteRoomResponse,
	IRoomEditedResponse,
	IJoinRoomData,
	IJoinRoomRes
} from "../shared/shared";

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
	owner: Socket,
	name: string,
	password: string,
}

interface UserRoomLookup {
	isOwner: boolean,
	uuid: UUID,
}

const _rooms = new Map<UUID, Room>();

io.on("connection", (socket) => {
	let info: UserRoomLookup | null = null;
	
	socket.emit("connectRes", {
		socketId: socket.id,
	} as ISocketConnectResponse);

	// SOCKET LISTENERS

	socket.on("makeRoom", (data: IMakeRoomData) => { 
		const _uuid = v4();
		_rooms.set(_uuid, {
			participants: [],
			owner: socket,
			name: data.roomName,
			password: data._roomPassword
		});

		info = {
			uuid: _uuid,
			isOwner: true,
		}

		socket.emit("makeRoomResponse", {
			isSuccess: true,
			roomUuid: _uuid,
		} as IMakeRoomResponse);
	});

	socket.on("editRoom", (data: IMakeRoomData) => {
		if (info?.isOwner) {
			const current = _rooms.get(info!.uuid);

			_rooms.set(info!.uuid, {
				participants: current!.participants,
				owner:        current!.owner,
				name:         data.roomName,
				password:     data._roomPassword
			});

			socket.emit("editRoomRes", {
				isSuccess: true,
			} as IRoomEditedResponse);


			if (data.roomName !== current!.name)
				socket.broadcast.emit("roomEdited", { newName: data.roomName });
			
		} else
			socket.emit("editRoomRes", {
				isSuccess: false,
				errorMessage: "You are not the owner of this room!",
			} as IRoomEditedResponse);

		_rooms.delete(info!.uuid);
	});

	socket.on("deleteRoom", () => {
		if (info?.isOwner) {
			socket.emit("deleteRoomRes", {
				isSuccess: true,
			} as IDeleteRoomResponse);

			socket.broadcast.emit("roomDeleted");
			
			_rooms.delete(info!.uuid);
		} else {
			socket.emit("deleteRoomRes", {
				isSuccess: false,
				errorMessage: "You are not the owner of this room!",
			} as IDeleteRoomResponse);
		}
	});

	socket.on("joinRoom", (data: IJoinRoomData) => {
		const room_ref = _rooms.get(data.roomUUID);

		let isSuccess: boolean = false;
		let errorMesage: string | undefined = "The room not found or password did not match";
		let roomSocketIds: string[] | undefined = undefined;
		if (room_ref?.password === data.roomPassword) {
			roomSocketIds = [room_ref.owner.id, ...room_ref.participants.map((s) => s.id)];
			isSuccess = true;
			errorMesage = undefined;
		}

		socket.emit("joinRoomRes", {
			isSuccess,
			errorMesage,
			peerSocketIds: roomSocketIds,
		} as IJoinRoomRes);


		
		if (isSuccess) {}
			
	});

	socket.on("disconnect", () => {
		socket.broadcast.emit("userDisconnected", {
			userSocketId: socket.id,
		} as IUserDisconnectedData);
	});

});

server.listen(PORT, () => {
	process.stdout.write(`Listening on ${PORT}\r\n`);
});

