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
	ICallAcceptedData,
	IRoomEdited,
	IEditRoomData,
	IChangeNameData,
	IChangeNameRes
} from "../shared/shared";
import { isNullOrUndefined } from "util";


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

interface User {
	name: string,
	socket: Socket,
}

interface Room {
	participants: User[],
	owner: User,
	name: string,
	password: string,
}

interface UserRoomLookup {
	isConnected: boolean,
	isOwner: boolean,
	uuid: UUID,
	name: string,
}

const _rooms = new Map<UUID, Room>();

const getOtherSocketIdsInRoom = (roomUUID : UUID, ownId: UUID) => {
	let lookup = _rooms.get(roomUUID)!;
	return [lookup.owner.socket.id, ...lookup.participants.map((p) => {p.socket.id})].filter((i) => i !== ownId);
}

io.on("connection", (socket) => {
	dbg(`New user connected | id: ${socket.id}`)
	let info: UserRoomLookup = {
		isConnected: false,
		isOwner: false,
		uuid: "",
		name: "",
	};
	
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
			owner: {
				socket,
				name: data.name,
			},
			name: data.roomName,
			password: data.roomPassword,
		});
		
		info = {
			uuid: _uuid,
			isOwner: true,
			name: data.name,
			isConnected: true,
		}

		socket.emit("createRoomRes", {
			isSuccess: true,
			roomUuid: _uuid,
		} as ICreateRoomRes);

		dbg(`A new room  (${info?.uuid} -- ${data.roomName}) was created`);
	});

	socket.on("editRoom", (data: IEditRoomData) => {
		dbg(`User ${socket.id} has requested to edit room (${info?.uuid} -- ${data.roomName})`);

		if (!info || !info?.isOwner) {
			socket.emit("editRoomRes", {
				isSuccess: false,
				errorMessage: "You are not the owner of this room!",
			} as IEditRoomRes);
			return;
		}

		const current = _rooms.get(info!.uuid);

		_rooms.set(info!.uuid, {
			participants: current!.participants,
			owner:        current!.owner,
			name:         (data.roomName === null) ? current!.name : data.roomName,
			password:     (data.roomPassword === null) ? current!.password : data.roomPassword,
		});

		dbg(`Room  (${info?.uuid} -- ${data.roomName}) was changed. (new name ${data.roomName})`);


		socket.emit("editRoomRes", {
			isSuccess: true,
		} as IEditRoomRes);


		if (data.roomName !== current!.name)
			for (let id of Array.from(getOtherSocketIdsInRoom(info?.uuid, socket.id)))
				io.to(id!).emit("roomEdited", { roomName: data.roomName } as IRoomEdited);
			
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

		const roomRef = _rooms.get(data.roomUUID);

		let isSuccess: boolean = false;
		let errorMesage: string | undefined = "The room was not found or password did not match";
		let roomSocketIds: string[] | undefined = undefined;
		if (roomRef?.password === data.roomPassword || roomRef?.password === "") {
			roomSocketIds = [roomRef.owner.socket.id, ...roomRef.participants.map((s) => s.socket.id)];
			isSuccess = true;
			errorMesage = undefined;
		}

		socket.emit("joinRoomRes", {
			isSuccess,
			errorMesage,
			peerSocketIds: roomSocketIds,
			roomName: roomRef?.name,
			ownerName: roomRef?.owner.name,
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

	socket.on("leaveRoom", () => {
		info = {
			isConnected: false,
			isOwner: false,
			uuid: "",
			name: info?.name || "",
		}
	});

	socket.on("changeName", (data: IChangeNameData) => {
		info.name = data.newName;

		socket.emit("changeNameRes", {
			isSuccess: true,
		} as IChangeNameRes)
	})

	socket.on("disconnect", () => {
		dbg(`User ${socket.id} has disconnected`);

		// do not do anything else if user isn't connected to a room
		if (!(info?.isConnected)) return;


		let roomRef = _rooms.get(info.uuid)!;

		// if there is no one remaining in the room, destroy it 
		if (roomRef.participants.length == 0 && info.isOwner) {
			_rooms.delete(info.uuid);
			return
		}

		// if there is still someone in the room and user was the owner,
		// transfer owner to them (if there is multiple people, choose one at random)
		if (roomRef.participants.length > 0 && info.isOwner) {
			// var item = items[Math.floor(Math.random()*items.length)];
			let chosenIdx = Math.floor(Math.random()*roomRef.participants.length);
			let chosenSocketId = roomRef.participants[chosenIdx].socket.id;

			_rooms.set(info.uuid, {
				name: roomRef.name,
				owner: roomRef.participants[chosenIdx],
				participants: roomRef.participants.filter((p) => p.socket.id !== chosenSocketId),
				password: roomRef.password,
			});

			Array.from(getOtherSocketIdsInRoom(info.uuid, chosenSocketId)).forEach((id) => {
				io.to(id!).emit("changedOwner", {
					newOwnerName: roomRef.participants[chosenIdx].name,
					newOwnerSocketId: chosenSocketId
				});
			})

			io.to(chosenSocketId).emit("promotedToOwner");
			dbg(`Room ${info.uuid} changed owner due to last owner disconnecting`)
		} 

		// notify other users in room
		for (let id of Array.from(getOtherSocketIdsInRoom(info?.uuid, socket.id)))
			io.to(id!).emit("userDisconnected", {
				userName: info.name,
				userSocketId: socket.id
			} as IUserDisconnectedData);

		socket.broadcast.emit("userDisconnected", {
			userSocketId: socket.id,
		} as IUserDisconnectedData);
	});

});

server.listen(PORT, () => {
	process.stdout.write(`Listening on ${PORT}\r\n`);
});

