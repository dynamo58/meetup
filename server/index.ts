const PORT = process.env.PORT || 3001;

import express from "express";
import * as http from "http"
import { Server as SocketIOServer, Socket } from "socket.io";
import cors, {} from "cors";
import { v4 } from "uuid";

import {
	UUID,
	ISocketConnectRes,
	IUserDisconnectedData,
	ICreateRoomData,
	ICreateRoomRes,
	IDeleteRoomRes,
	IEditRoomRes,
	IJoinRoomData,
	IJoinRoomRes,
	ICallUserData,
	IUserIsCallingData,
	IGetRoomsRes,
	RoomGist,
	IAnswerCallData,
	ICallAcceptedData
} from "../shared/shared";


const IS_DEBUG_MODE = process.env.DEBUG_MODE === "1";
const dbg = (a: any) => {
	if (IS_DEBUG_MODE)
		process.stdout.write(`${a}\n`)
}

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
	dbg(`New user connected | id: ${socket.id}`)
	let info: UserRoomLookup | null = null;
	
	socket.emit("connectionRes", {
		socketId: socket.id,
	} as ISocketConnectRes);

	// SOCKET LISTENERS

	socket.on("getRooms", () => {
		let rooms_arr = [];

		for (let entry of Array.from(_rooms.entries())) {
			rooms_arr.push({
				uuid: entry[0],
				name: entry[1].name,
				activeCallersNum: entry[1].participants.length+1,
				has_password: entry[1].password !== ""
			} as RoomGist);
		};

		socket.emit("getRoomsRes", {
			rooms: rooms_arr,
		} as IGetRoomsRes);
	});

	socket.on("createRoom", (data: ICreateRoomData) => {
		dbg(`User ${socket.id} has requested to make a room`);

		const _uuid = v4();
		_rooms.set(_uuid, {
			participants: [],
			owner: socket,
			name: data.roomName,
			password: data.roomPassword,
		});
		
		info = {
			uuid: _uuid,
			isOwner: true,
		}

		socket.emit("createRoomRes", {
			isSuccess: true,
			roomUuid: _uuid,
		} as ICreateRoomRes);

		dbg(`A new room  (${info?.uuid} -- ${data.roomName}) was created`);
	});

	socket.on("editRoom", (data: ICreateRoomData) => {
		dbg(`User ${socket.id} has requested to edit room (${info?.uuid} -- ${data.roomName})`);

		if (info?.isOwner) {
			const current = _rooms.get(info!.uuid);

			_rooms.set(info!.uuid, {
				participants: current!.participants,
				owner:        current!.owner,
				name:         data.roomName,
				password:     data.roomPassword
			});

			dbg(`Room  (${info?.uuid} -- ${data.roomName}) was changed. (new name ${data.roomName})`);


			socket.emit("editRoomRes", {
				isSuccess: true,
			} as IEditRoomRes);


			if (data.roomName !== current!.name)
				socket.broadcast.emit("roomEdited", { newName: data.roomName });
			
		} else
			socket.emit("editRoomRes", {
				isSuccess: false,
				errorMessage: "You are not the owner of this room!",
			} as IEditRoomRes);

		_rooms.delete(info!.uuid);
	});

	socket.on("deleteRoom", () => {
		dbg!(`User ${socket.id}  has requested to delete room (${info?.uuid})`)
		if (info?.isOwner) {
			socket.emit("deleteRoomRes", {
				isSuccess: true,
			} as IDeleteRoomRes);

			socket.broadcast.emit("roomDeleted");
			
			_rooms.delete(info!.uuid);
		} else {
			socket.emit("deleteRoomRes", {
				isSuccess: false,
				errorMessage: "You are not the owner of this room!",
			} as IDeleteRoomRes);
		}
	});

	socket.on("joinRoom", (data: IJoinRoomData) => {
		dbg(`User ${socket.id} has requested to join a room ${data.roomUUID}`);

		const room_ref = _rooms.get(data.roomUUID);

		let isSuccess: boolean = false;
		let errorMesage: string | undefined = "The room was not found or password did not match";
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
	});

	socket.on("callUser", (data: ICallUserData) => {
		dbg(`User ${socket.id} is calling ${data.userToCallUUID}`);

		io.to(data.userToCallUUID).emit("userIsCalling", {
			signalData: data.signalData,
			callerName: data.name,
			callerSocketId: socket.id,
		} as IUserIsCallingData);
	});

	socket.on("answerCall", (data: IAnswerCallData) => {
		dbg(`User ${socket.id} is answering the call from ${data.endpointSocketId}`);

		io.to(data.endpointSocketId).emit("callAccepted", {
			signalData: data.signalData,
		} as ICallAcceptedData);
	});

	socket.on("disconnect", () => {
		dbg(`User ${socket.id} has disconnected`);


		// if (info) {
		// 	const room = _rooms.get(info?.uuid);

		// 	 if (room?.participants.length === 0 &&  info.isOwner)
		// 	 	_rooms.delete(info.uuid);
		// }

		socket.broadcast.emit("userDisconnected", {
			userSocketId: socket.id,
		} as IUserDisconnectedData);
	});

});

server.listen(PORT, () => {
	process.stdout.write(`Listening on ${PORT}\r\n`);
});

