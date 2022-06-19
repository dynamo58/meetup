export interface ISocketConnectResponse {
	socketId: string,
	uuid: string,
}

export interface ICallUserData {
	userToCall: string,
	signalData: string,
	from: string,
	name: string,
}

export interface ICallUserResponse {
	signal: string,
	from: string,
	name: string
} 
