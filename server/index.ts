const PORT = process.env.PORT || 3001;

import express from "express";
import * as http from "http"
import { Server as SocketIOServer } from "socket.io";
import cors, { } from "cors";
import { v4 } from "uuid";

import { ISocketConnectRes, IUserDisconnectedData, ICreateRoomData, ICreateRoomRes, IDeleteRoomRes, IEditRoomRes, IJoinRoomData, IJoinRoomRes, ICallUserData, IUserIsCallingData, IGetRoomsRes, RoomGist, IAnswerCallData, ICallAcceptedData, IRoomEdited, IEditRoomData, IChangeNameData, IChangeNameRes, UserGist } from "../shared/socket";

import {
	User,
	Room,
	UserRoomLookup,
} from "./lib"

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


let _rooms: Room[] = [];

const getRoomIdx = (uuid: string): number | null => {
	let idx = 0;
	for (let r of _rooms) {
		if (r.uuid === uuid)
			return idx;
		idx++;
	}

	return null;
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

	// allows to fetch information about all of the rooms
	socket.on("getRooms", () => {
		let rooms_arr = [];

		for (let r of _rooms) {
			rooms_arr.push({
				uuid: r.uuid,
				name: r.name,
				activeCallersNum: r.participants.length + 1,
				has_password: r.password !== ""
			} as RoomGist);
		};

		socket.emit("getRoomsRes", {
			rooms: rooms_arr,
		} as IGetRoomsRes);
	});

	// allows user to connect to a room -- consequently becomes the owner of it
	socket.on("createRoom", (data: ICreateRoomData) => {
		dbg(`User ${socket.id} has requested to make a room`);

		const _uuid = v4();
		const r = new Room(_uuid, data.roomName, data.roomPassword, new User(data.name, socket, true));
		_rooms.push(r);

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

	// allow caller to edit name/password of room if they are an owner
	socket.on("editRoom", (data: IEditRoomData) => {
		if (!(info?.isConnected)) return;
		dbg(`User ${socket.id} has requested to edit room (${info?.uuid} -- ${data.roomName})`);

		if (!info || !info?.isOwner) {
			socket.emit("editRoomRes", {
				isSuccess: false,
				errorMessage: "You are not the owner of this room!",
			} as IEditRoomRes);
			return;
		}

		const idx = getRoomIdx(info.uuid)!;

		_rooms[idx].name = (data.roomName === null) ? _rooms[idx].name : data.roomName;
		_rooms[idx].password = (data.roomPassword === null) ? _rooms[idx]!.password : data.roomPassword;

		dbg(`Room  (${info?.uuid} -- ${data.roomName}) was changed. (new name ${data.roomName})`);


		socket.emit("editRoomRes", {
			isSuccess: true,
		} as IEditRoomRes);

		if (data.roomName !== null) {
			_rooms[idx]
				.getIds()
				.filter(i => i !== socket.id)
				.forEach(id => {
					io.to(id).emit("roomEdited", { roomName: data.roomName } as IRoomEdited)
				})
		}
	});

	socket.on("deleteRoom", () => {
		if (!(info?.isConnected)) return;
		dbg!(`User ${socket.id}  has requested to delete room (${info?.uuid})`);

		if (!info?.isOwner) {
			socket.emit("deleteRoomRes", {
				isSuccess: false,
				errorMessage: "You are not the owner of this room!",
			} as IDeleteRoomRes);
		}

		socket.emit("deleteRoomRes", {
			isSuccess: true,
		} as IDeleteRoomRes);

		const idx = getRoomIdx(info.uuid)!;

		_rooms[idx]
			.getIds()
			.filter(i => i !== socket.id)
			.forEach(id => { io.to(id).emit("roomDeleted") })

		_rooms.splice(idx, 1);
	});

	// client trying to join a voice chatroom
	socket.on("joinRoom", (data: IJoinRoomData) => {
		dbg(`User ${socket.id} has requested to join a room ${data.roomUUID}`);

		const idx = getRoomIdx(data.roomUUID);

		if (idx === null) {
			socket.emit("joinRoomRes", {
				isSuccess: false,
				errorMessage: "The specified room doesn't exist",
			} as IJoinRoomRes);
			return;
		}

		if (_rooms[idx!]?.password !== data.roomPassword &&
			_rooms[idx!]?.password !== "") {
			socket.emit("joinRoomRes", {
				isSuccess: false,
				errorMesage: "The password provided is incorrect",
			} as IJoinRoomRes);
			return;
		}

		_rooms[idx].participants.push({
			socket,
			name: data.nickname,
			isOwner: false,
		})

		socket.emit("joinRoomRes", {
			peerSocketIds: _rooms[idx].participants
				.map((p) => ({
					peerName: p.name,
					peerSocketId: p.socket.id,
				} as UserGist))
				.filter(s => s.peerSocketId !== socket.id),
			isSuccess: true,
			errorMessage: undefined,
			roomName: _rooms[idx].name,
			ownerName: _rooms[idx].participants.filter(p => p.isOwner == true)[0].name,
		} as IJoinRoomRes);

		info = {
			isConnected: true,
			isOwner: false,
			uuid: _rooms[idx].uuid,
			name: _rooms[idx].name,
		}
	});

	// client attempting to call someone
	socket.on("callUser", (data: ICallUserData) => {
		if (!(info?.isConnected)) return;
		dbg(`User ${socket.id} is calling ${data.userToCallUUID}`);

		io.to(data.userToCallUUID).emit("userIsCalling", {
			signalData: data.signalData,
			callerName: data.name,
			callerSocketId: socket.id,
		} as IUserIsCallingData);
	});

	// for when client decides to pick up a call request they've got
	socket.on("answerCall", (data: IAnswerCallData) => {
		if (!(info?.isConnected)) return;
		dbg(`User ${socket.id} is answering the call from ${data.endpointSocketId}`);

		io.to(data.endpointSocketId).emit("callAccepted", {
			signalData: data.signalData,
		} as ICallAcceptedData);
	});

	// run when user is leaving room
	// regardless or when leaving completely or just the room
	const userLeavingRoomIntrinsics = () => {
		const idx = getRoomIdx(info.uuid);
		if (idx === null) return;

		// if there is no one remaining in the room, destroy it 
		if (_rooms[idx].participants.length == 1) {
			_rooms.splice(idx, 1);
			return;
		}

		// if there is still someone in the room and user was the owner,
		// transfer owner to them (if there is multiple people, choose one at random)
		if (_rooms[idx].participants.length > 1 && info.isOwner) {
			let chosenIdx = Math.floor(Math.random() * _rooms[idx].participants.length);
			let chosenSocketId = _rooms[idx].participants[chosenIdx].socket.id;

			_rooms[idx].participants = _rooms[idx].participants
				.map((p, idx) => {
					if (idx == chosenIdx)
						return { ...p, isOwner: true }
					return p;
				}),

				// notify all of the users apart from the one who left
				// and the leader that the owner has changed
				_rooms[idx]
					.getIds()
					.filter(i => i !== socket.id && i !== chosenSocketId)
					.forEach((id) => {
						io.to(id).emit("changedOwner", {
							newOwnerName: _rooms[idx].participants[chosenIdx].name,
							newOwnerSocketId: chosenSocketId
						});
					})

			io.to(chosenSocketId).emit("promotedToOwner");
			dbg(`Room ${info.uuid} changed owner due to last owner disconnecting`)
		}

		// if we got here, that means that the user was a regular participant
		// and therefore they shall be erased from the array
		_rooms[idx].participants = _rooms[idx].participants.filter(p => p.socket.id !== socket.id)

		// notify other users in room
		const otherUsersIds = _rooms[idx]
			.getIds()
			.filter((i) => i !== socket.id)
		for (let id of otherUsersIds)
			io.to(id).emit("userDisconnected", {
				userName: info.name,
				userSocketId: socket.id
			} as IUserDisconnectedData);

		info = {
			isConnected: false,
			isOwner: false,
			uuid: "",
			name: info?.name || "",
		}
	}

	socket.on("leaveRoom", () => {
		// do not do anything else if user isn't connected to a room
		if (!(info?.isConnected)) return;
		dbg(`User ${socket.id} left room ${info.uuid}`);

		userLeavingRoomIntrinsics();
	});

	socket.on("disconnect", () => {
		if (!(info?.isConnected)) return;
		dbg(`User ${socket.id} has disconnected`);

		userLeavingRoomIntrinsics();
	});

	socket.on("changeName", (data: IChangeNameData) => {
		info.name = data.newName;
		dbg(`User ${socket.id} changed their name`)
		socket.emit("changeNameRes", {
			isSuccess: true,
		} as IChangeNameRes)
	});
});

server.listen(PORT, () => {
	process.stdout.write(`Listening on ${PORT}\r\n`);
});

