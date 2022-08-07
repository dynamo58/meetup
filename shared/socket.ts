export type UUID = string;

export interface ISocketConnectRes {
	socketId: string,
};

export interface IUserDisconnectedData {
	userSocketId: string,
	userName: string
};

export interface ICreateRoomData {
	name: string,
	roomName: string,
	roomPassword: string,
};

export interface ICreateRoomRes {
	isSuccess: boolean,
	errorMessage?: string,
	roomUuid?: UUID,
};

export interface IDeleteRoomRes {
	isSuccess: boolean,
	errorMessage?: string,
};

export interface IEditRoomData {
	roomName: string | null,
	roomPassword: string | null,
};

export interface IEditRoomRes {
	isSuccess: boolean,
	errorMessage?: string,
};

export interface IJoinRoomData {
	roomUUID: UUID,
	roomPassword: string,
	nickname: string,
};

export interface UserGist {
	peerName: string,
	peerSocketId: string,
}

export interface IJoinRoomRes {
	isSuccess: boolean,
	errorMessage?: string,
	peerSocketIds?: UserGist[],
	roomName?: string,
	ownerName?: string,
};

export interface ICallUserData {
	signalData: any,
	name: string,
	userToCallUUID: string,
};

export interface IUserIsCallingData {
	signalData: any,
	callerName: string,
	callerSocketId: string,
};

export interface IAnswerCallData {
	endpointSocketId: string,
	signalData: any,
};

export interface RoomGist {
	name: string,
	uuid: string,
	activeCallersNum: number,
	has_password: boolean,
}

export interface IGetRoomsRes {
	rooms: RoomGist[],
};

export interface ICallAcceptedData {
	signalData: any,
}

export interface IRoomEdited {
	roomName: string,
}

export interface IChangeNameData {
	newName: string,
}

export interface IChangeNameRes {
	isSuccess: boolean,
	errorMessage?: string,
}
