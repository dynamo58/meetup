import { Socket } from "socket.io";
import { UUID } from "../shared/socket";


interface IUser {
	name: string,
	socket: Socket,
	isOwner: boolean,
}

export class User implements IUser {
	name: string;
	socket: Socket;
	isOwner: boolean;

	constructor(name: string, socket: Socket, isOwner: boolean) {
		this.name = name;
		this.socket = socket;
		this.isOwner = isOwner;
	}
}

interface IRoom {
	uuid: string,
	name: string,
	password: string,
	participants: User[],
}

export class Room implements IRoom {
	participants: User[];
	uuid: string;
	name: string;
	password: string;

	constructor(uuid: string, name: string, password: string, owner: User) {
		this.uuid = uuid;
		this.name = name;
		this.password = password;
		this.participants = [owner];
	}

	getIds(): string[] {
		return this.participants.map((p) => p.socket.id);
	};
}

export interface UserRoomLookup {
	isConnected: boolean,
	isOwner: boolean,
	uuid: UUID,
	name: string,
}
