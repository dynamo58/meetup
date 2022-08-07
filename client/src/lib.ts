import { Instance } from "simple-peer";

export interface VideoParticipant {
	peer: Instance,
	stream: MediaStream,
	name: string,
	socketId: string,
};

export interface RoomUserSpecifics {
	roomName: string,
	isConnected: boolean,
	isOwner: boolean,
	// is `null` if `isOwner` is `true`
	ownerName: string | null,
	peers: VideoParticipant[],
	uuid: string | null,
}

export function getTimestampStr(): string {
	const date = new Date();
	return `[${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}]`
}

export function dbg(a: any) {
	console.log(`[${(new Date()).toLocaleTimeString("cs-CZ")}] ${a}`);
}
