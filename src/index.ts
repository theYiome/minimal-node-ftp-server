import { loadJSON } from './files';
import { manageClientRequest, responses, storageDir } from './ftpServer';

const fsPromises = require("fs").promises;

const portArg = process.argv.find(arg => parseInt(arg));
const port = portArg ? portArg : 21;

const logDir = "logs";
const logFile = "logs/ftpServer.log";
fsPromises.mkdir(logDir, { recursive: true });

type User = {
    username: string;
    password: string;
};

let users: User[] = null;

loadJSON("users.json").then(file => {
    users = file.users;
    fsPromises.mkdir(storageDir, { recursive: true });
    users.forEach(user => {
        const mainUserDir = "storage/" + user.username;
        fsPromises.mkdir(mainUserDir, { recursive: true })

        const publicUserDir = mainUserDir + "/public";
        fsPromises.mkdir(publicUserDir, { recursive: true })
    });
});


const log = require('log-to-file');
const telnet = require('telnet');
telnet.createServer(function (client: any) {

    // listen for data from the client
    client.on('data', (buffer: Buffer) => {
        const data: string = buffer.toString().trim();
        const dataSplitted = data.split(" ");
        const command = dataSplitted[0];
        const value = dataSplitted[1];

        const username = (client.username && client.loginSuccessful) ? client.username : "anonymous";

        log(JSON.stringify({command, value, username}), logFile);
        manageClientRequest(client, users, command, value);
    });

    client.write(responses.ready);

}).listen(port);

export { User };