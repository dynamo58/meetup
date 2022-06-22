# Meetup

A simple P2P secure video conferencing app.


<div align="center">
	<img src="client/public/favicon.webp"></img>
</div>

### The stack
* React
	- Chakra UI (UI library)
* simple-peer (implementation for WebRTC)
* express (web framework)
* socket.io (WebSocket-like abstraction above HTTP)

# Run yourself

1. Clone the repo
```bash
git clone https://github.com/dynamo58/meetup
cd meetup
```

2. Install dependencies & run server
```bash
cd server
npm i
npm run dev
```

3. Install dependencies & run client
```bash
cd client
npm i
npm run dev
```
