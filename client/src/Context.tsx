import React, { createContext, useState, useRef, useEffect, RefObject, PropsWithChildren, MutableRefObject } from "react";
import { io } from "socket.io-client";
import Peer, { Instance } from "simple-peer";

interface Call {
	isReceivingCall: boolean,
	from: string,
	name: string,
	signal: string,
}

interface ISocketContext {
	call: Call | null,
	callAccepted: boolean,
	callEnded: boolean,
	ownVideo: RefObject<HTMLVideoElement>,
	userVideo: RefObject<HTMLVideoElement>,
	stream: MediaStream | undefined,
	name: string,
	setName: React.Dispatch<React.SetStateAction<string>>,
	socketId: string,
	callUser: (id: string) => void,
	leaveCall: () => void,
	answerCall: () => void,
};

const SocketContext = createContext<ISocketContext | undefined>(undefined);

const socket = io("http://localhost:3001");


const ContextProvider = (props: PropsWithChildren) => {
	const ownVideo = useRef<HTMLVideoElement>(null);
	const userVideo = useRef<HTMLVideoElement>(null);
	const connRef: MutableRefObject<Instance | null>  = useRef(null);

	const [stream, setStream]             = useState<MediaStream | undefined>(undefined);
	const [socketId, setSocketId]         = useState("");
	const [call, setCall]                 = useState<Call | null>(null);
	const [callAccepted, setCallAccepted] = useState(false);
	const [callEnded, setCallEnded]       = useState(false);
	const [name, setName]                 = useState("")

	useEffect(() => {
		navigator.mediaDevices.getUserMedia({
			video: true,
			audio: true
		}).then((_stream) => {
			setStream(_stream);
			ownVideo!.current!.srcObject = _stream;
		});
		socket.on("connectRes", (id) => {
			setSocketId(id);
		});
		socket.on("callUser", ({ from, name: callerName, signal }) => {
			setCall({
				isReceivingCall: true,
				from,
				name: callerName,
				signal
			})
		});
	}, []);

	const answerCall = () => {
		setCallAccepted(true);

		const peer = new Peer({
			initiator: false,
			trickle: false,
			stream,
		});

		peer.on("signal", (data) => {
			socket.emit("answerCall", {signal: data, to: call!.from});
		});

		peer.on("stream", (_stream) => {
			userVideo!.current!.srcObject = _stream;
		});

		peer.signal(call!.signal);
		connRef.current = peer;
	};

	const callUser = (id: string) => {
		const peer = new Peer({
			initiator: true,
			trickle: false,
			stream,
		});

		peer.on("signal", (data) => {
			socket.emit("callUser", {
				userToCall: id,
				signalData: data,
				from: socketId,
				name
			});
		});

		peer.on("stream", (_stream) => {
			userVideo!.current!.srcObject = _stream;
		});

		socket.on("callAccepted", (signal) => {
			setCallAccepted(true);
			peer.signal(signal);
		});

		connRef.current = peer;
	};

	const leaveCall = () => {
		setCallEnded(true);
		connRef.current!.destroy()
	};

	return (
		<SocketContext.Provider value={{
			call,
			callAccepted,
			callEnded,
			ownVideo,
			userVideo,
			stream,
			name,
			setName,
			socketId,
			callUser,
			leaveCall,
			answerCall,
			}}
		>
			{props.children}
		</SocketContext.Provider>
	);
};

export { ContextProvider, SocketContext };
export type { ISocketContext };