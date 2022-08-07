import React, { createContext, useState, useRef, RefObject, PropsWithChildren, useEffect } from "react";
import { io } from "socket.io-client";
import Peer from "simple-peer";

import { IGetRoomsRes, ISocketConnectRes, IJoinRoomData, IJoinRoomRes, IUserIsCallingData, IAnswerCallData, ICreateRoomData, ICreateRoomRes, IEditRoomRes, ICallUserData, ICallAcceptedData, IEditRoomData, IUserDisconnectedData, IChangeNameData, IChangeNameRes, IRoomEdited } from "../../shared/socket";
import { ModalControls } from "./components/Modal";
import { RoomUserSpecifics, getTimestampStr, dbg } from "./lib"


interface IContext {
	ownVideoRef: RefObject<HTMLVideoElement>,
	name: string,
	setNameHandler: (n: string) => void,
	socketId: string,
	createRoom: (roomUUID: string, roomPassword: string) => void,
	joinRoom: (roomUUID: string, roomPassword: string) => void,
	leaveRoomHandler: () => void,
	initVideo: () => void,
	updateRoom: (arg0: IEditRoomData) => void,
	roomInfo: RoomUserSpecifics,
	getRooms: () => void,
	rooms: IGetRoomsRes | null,
	modal: ModalControls,
	setModal: React.Dispatch<React.SetStateAction<ModalControls>>,
	roomActivityLog: string[],
	setName: React.Dispatch<React.SetStateAction<string>>,
};

const Context = createContext<IContext | null>(null);
const socket = io("http://localhost:3001");

const ContextProvider = (props: PropsWithChildren) => {
	let [myStream, setMyStream] = useState<MediaStream>();
	const [socketId, setSocketId] = useState("");
	const [name, setName] = useState("");
	const [roomActivityLog, setRoomActivityLog] = useState<string[]>([]);
	// setRoomActivityLog wrapper
	const sralW = (act: string) => {
		setRoomActivityLog(i => ([`${getTimestampStr()} ${act}`, ...i]));
	}


	const [modal, setModal] = useState<ModalControls>({
		heading: "",
		text: "",
		isVisible: false,
	});

	const [rooms, setRooms] = useState<IGetRoomsRes | null>(null)

	const [roomInfo, setRoomInfo] = useState<RoomUserSpecifics>({
		roomName: "",
		isConnected: false,
		isOwner: false,
		peers: [],
		uuid: null,
		ownerName: null,
	});

	const ownVideoRef = useRef<HTMLVideoElement>(null);

	const getStream: () => Promise<MediaStream | null> = async () => {
		let t = await navigator.mediaDevices.getUserMedia({
			video: true,
			audio: true
		})
			.then((s) => {
				setMyStream(s);
				return s;
			})
			.catch((e) => {
				console.log(e);
				return null;
			});
		return t;
	}

	const setNameHandler = (s: string) => {
		if (s === "") {
			setModal({
				heading: "Error changing name",
				text: "You must set a valid name!",
				isVisible: true,
			});
			return;
		}

		socket.emit("changeName", {
			newName: s,
		} as IChangeNameData)

		socket.on("changeNameRes", (data: IChangeNameRes) => {
			if (!data.isSuccess) {
				setModal({
					heading: "Error changing name",
					text: data.errorMessage || "",
					isVisible: true,
				});
				return;
			}

			dbg(`Name changed to ${s}`);
			sralW(`Name changed to ${s}`);
			setName(s);
			localStorage.setItem("name", s);
		});
	}

	useEffect(() => {
		socket.on("connectionRes", (data: ISocketConnectRes) => {
			dbg(`Connected to server with socket.io`);
			setSocketId(data.socketId);
		});

		socket.on("userIsCalling", async (data: IUserIsCallingData) => {
			dbg(`Received call request from ${data.callerSocketId}`);

			const peer = new Peer({
				initiator: false,
				trickle: false,
				// for some reason the stream goes null,
				// i dont exactly know why
				stream: myStream || (await getStream())!,
			});

			peer.on("signal", (signalData) => {
				dbg(`Answering call to ${data.callerSocketId}`);

				socket.emit("answerCall", {
					endpointSocketId: data.callerSocketId,
					signalData
				} as IAnswerCallData);
			});

			peer.on("stream", (_stream) => {
				dbg(`Stream from user ${data.callerSocketId}`);
				sralW(`Connected with user ${data.callerName}`)

				setRoomInfo((i) => ({
					...i,
					peers: [...i.peers, {
						name: data.callerName,
						stream: _stream,
						peer,
						socketId: data.callerSocketId
					}],
				}))
			});
			peer.signal(data.signalData);
		});

		socket.on("promotedToOwner", () => {
			setRoomInfo((i) => ({
				...i,
				isOwner: true,
			}));
			sralW("You were promoted to be the rooms owner.");
		});

		socket.on("userDisconnected", (data: IUserDisconnectedData) => {
			setRoomInfo(i => ({
				...i,
				peers: i.peers.filter(p => p.socketId !== data.userSocketId)
			}));
			sralW(`User ${data.userName} disconnected`)
		});

		const roomEditedHandler = (data: IRoomEdited) => {
			setRoomInfo((i) => ({
				...i,
				roomName: data.roomName,
			}));
			sralW(`Room was edited by owner`)
		}
		socket.on("roomEdited", (data: IRoomEdited) => roomEditedHandler(data));
	}, [])

	const initVideo = () => {
		getStream()
			.then((st) => {
				if (st === null) {
					setModal({
						heading: "No webcam or microphone detected",
						text: "Those two components are required for participation in calls",
						isVisible: true,
					});
					return;
				}

				dbg(`Got stream from webcam and microphone`);
				setMyStream(st!);
				window.addEventListener("videoInit", () => {
					ownVideoRef.current!.srcObject = st;
				})
			});
	}

	const joinRoom = (roomUUID: string, roomPassword: string) => {
		dbg(`Attempting to join room ${roomUUID}`);

		socket.emit("joinRoom", {
			roomUUID,
			roomPassword,
			nickname: name,
		} as IJoinRoomData);

		socket.on("joinRoomRes", (joinRoomData: IJoinRoomRes) => {
			if (!joinRoomData.isSuccess) {
				setModal({
					text: joinRoomData.errorMessage || "",
					heading: "Error connecting",
					isVisible: true,
				});
				return;
			}

			sralW(`Joined room ${joinRoomData.roomName}`);
			dbg(`Successfully joined room ${roomUUID}`);

			console.log(joinRoomData.peerSocketIds!);
			for (const { peerSocketId, peerName } of joinRoomData.peerSocketIds!) {
				dbg(`Attempting to call ${peerSocketId}`);


				const peer = new Peer({
					initiator: true,
					trickle: false,
					stream: myStream,
				});

				peer.on("signal", (data) => {
					socket.emit("callUser", {
						userToCallUUID: peerSocketId,
						signalData: data,
						name
					} as ICallUserData);
				});

				peer.on("stream", (_stream) => {
					dbg(`Stream received from  ${peerSocketId}`);
					sralW(`Connected with user ${peerName}`);

					setRoomInfo((i) => ({
						isOwner: false,
						peers: [...i.peers, {
							name: "xd",
							stream: _stream,
							peer,
							socketId: peerSocketId,
						}],
						isConnected: true,
						uuid: roomUUID,
						ownerName: joinRoomData.ownerName!,
						roomName: joinRoomData.roomName!
					}));
				});

				socket.on("callAccepted", (data: ICallAcceptedData) => {
					dbg(`${peerSocketId} accepted call`);
					peer.signal(data.signalData);
				});
			}
		});
	}

	const createRoom = (roomName: string, roomPassword: string) => {
		dbg(`Attempting to create room ${roomName}`);

		socket.emit("createRoom", {
			roomName,
			roomPassword
		} as ICreateRoomData);

		socket.on("createRoomRes", (data: ICreateRoomRes) => {
			if (!data.isSuccess) {
				setModal({
					heading: "Error creating room",
					text: data.errorMessage || "",
					isVisible: true,
				});
				return;
			}

			dbg(`Successfully created room ${roomName}, uuid ${data.roomUuid}`);
			sralW(`Room ${roomName} created`);

			setRoomInfo((i) => ({
				isOwner: true,
				peers: i.peers,
				isConnected: true,
				uuid: data.roomUuid!,
				ownerName: name,
				roomName,
			}));
		});
	}

	// update the current room
	const updateRoom = (arg0: IEditRoomData) => {
		dbg(`Attempting to update room ${name}`);

		socket.emit("editRoom", arg0);

		socket.on("editRoomRes", (data: IEditRoomRes) => {
			if (!data.isSuccess) {
				setModal({
					text: data.errorMessage || "",
					heading: "Error editing room",
					isVisible: true,
				});
				return;
			}

			dbg(`Room ${roomInfo.roomName} successfully edited`);
			setRoomInfo((i) => ({
				...i,
				roomName: arg0.roomName!,
			}));
		})
	}

	// get info about all of the rooms there are
	const getRooms = () => {
		dbg("Attempting to fetch rooms");

		socket.emit("getRooms");

		socket.on("getRoomsRes", (data: IGetRoomsRes) => {
			setRooms(data);
			dbg(`Received rooms`)
		});
	}

	// gets triggered everytime user goes out of the `/room` endpoint 
	const leaveRoomHandler = () => {
		if (!roomInfo.isConnected) return;
		dbg(`Leaving room`);

		// identify the server, which tells all other peers in room
		socket.emit("leaveRoom");

		// clean up
		roomInfo.peers.forEach(p => {
			p.peer.destroy();
		});

		setRoomInfo(_ => ({
			roomName: "",
			isConnected: false,
			isOwner: false,
			peers: [],
			uuid: null,
			ownerName: null,
		}));
	};

	return (
		<Context.Provider value={{
			setName,
			setModal,
			modal,
			rooms,
			getRooms,
			updateRoom,
			initVideo,
			ownVideoRef,
			name,
			setNameHandler,
			socketId,
			leaveRoomHandler,
			joinRoom,
			createRoom,
			roomInfo,
			roomActivityLog,
		}}
		>
			{props.children}
		</Context.Provider>
	);
};

export { ContextProvider, Context };
export type { IContext };
