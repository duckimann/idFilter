const fs = require("fs"), path = require("path");
const express = require("express"), server = express();

server.use(express.json());
// Handle requests
server.get("/", (a, b) => {
	b.sendFile(`${__dirname}/source.txt`, { headers: {"Content-Type": "text/txt"} });
});
server.post("/save", ({ body: {fname, flag, content} }, res) => {
	let path = `${__dirname}/${fname}.txt`;
	if (!fs.existsSync(path)) res.sendStatus(404);
	else {
		try {
			fs.writeFileSync(path, content, { encoding: "utf-8", flag });
			res.sendStatus(200);
		} catch (err) {
			res.send(500);
		}
	}
});

// Start server
server.listen(80, function() {
	let addr = this.address();
	console.log(`Server Started @ ${addr.address}${addr.port}\n`);
});