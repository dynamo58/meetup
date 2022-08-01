export function dbg(a: any) {
	// if (IS_DEBUG_MODE)
	console.log(`[${(new Date()).toLocaleTimeString("cs-CZ")}] ${a}`);
}