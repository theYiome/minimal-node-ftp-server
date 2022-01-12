import { loadJSON } from './files';
// import {promises as fsPromises} from 'node:fs';
const fsPromises = require("fs").promises;

const portArg = process.argv.find(arg => parseInt(arg));
const port = portArg ? portArg : 21;

type User = {
    username: string;
    password: string;
};

let users: User[] = null;

loadJSON("users.json").then(file => {
    users = file.users;

    const storageDir = "storage";
    fsPromises.mkdir(storageDir, { recursive: true });
    users.forEach(user => {
        const mainUserDir = "storage/" + user.username;
        fsPromises.mkdir(mainUserDir, { recursive: true })

        const publicUserDir = mainUserDir + "/public";
        fsPromises.mkdir(publicUserDir, { recursive: true })
    });
});


const parseSocketData = (rawData: string) => {
    const rawPort: string = rawData;
    const splittedPort = rawPort.split(",");
    const host = splittedPort[0] + "." + splittedPort[1] + "." + splittedPort[2] + "." + splittedPort[3];
    const port = (parseInt(splittedPort[4]) * 256) + parseInt(splittedPort[5]);
    return {host, port};
};

const telnet = require('telnet');
const net = require('net');

telnet.createServer(function (client: any) {

    const clientData = {
        username: null as string,
        password: null as string
    }

    // listen for the actual data from the client
    client.on('data', function (b: Buffer) {
        const data: string = b.toString().trim();
        const dataSplitted = data.split(" ");
        const command = dataSplitted[0];
        const value = dataSplitted[1];

        console.log({ data, value, command });

        switch (command) {
            case "OPTS": {
                client.write(responses.ok);
                break;
            }
            case "USER": {
                client.write(responses.passwordRequired);
                client.username = value;
                client.loginSuccessful = false;
                break;
            }
            case "PASS": {
                const givenUsername = client.username;
                const currentUser = users.find(user => user.username === givenUsername);
                const passwordCorrect = currentUser ? currentUser.password === value : false;
                if (currentUser && passwordCorrect) {
                    client.write(responses.loggedIn(givenUsername));
                    client.loginSuccessful = true;
                }
                else {
                    client.write(responses.loginFailed);
                    client.loginSuccessful = false;
                }
                break;
            }
            case "QUIT": {
                client.loginSuccessful = false;
                client.write(responses.disconnected);
                break;
            }
            case "PORT": {
                client.write(responses.ok);
                client.port = value;
                break;
            }
            case "XPWD":
            case "PWD":
            {
                client.write(responses.ok);
                break;
            }
            case "NLST": {
                client.write(responses.ok);
                break;
            }
            case "CWD": {
                client.write(responses.ok);
                break;
            }
            case "STOR": {
                client.write(responses.fileOk);

                const rawPort: string = client.port;
                const splittedPort = rawPort.split(",");
                const host = splittedPort[0] + "." + splittedPort[1] + "." + splittedPort[2] + "." + splittedPort[3];
                const port = (parseInt(splittedPort[4]) * 256) + parseInt(splittedPort[5]);

                console.log({ host, port });

                const connection = net.createConnection({ port, host }, () => {
                    console.log("Connected!");
                });
                connection.on('data', (data: any) => {
                    console.log({data, command, value});
                    //TODO: save to file
                });
                connection.on('end', () => {
                    client.write(responses.actionSuccessful);
                });

                break;
            }
            case "RETR": {
                client.write(responses.fileOk);

                const rawPort: string = client.port;
                const splittedPort = rawPort.split(",");
                const host = splittedPort[0] + "." + splittedPort[1] + "." + splittedPort[2] + "." + splittedPort[3];
                const port = (parseInt(splittedPort[4]) * 256) + parseInt(splittedPort[5]);

                console.log({ host, port });

                const connection = net.createConnection({ port, host }, () => {
                    console.log("Connected!");
                    connection.write("some file should be here!");
                    connection.end();
                });
                connection.on('end', () => {
                    client.write(responses.actionSuccessful);
                });

                break;
            }
            default: {
                console.warn(`${command} not implemented!`);
                client.write(responses.notImplemented);
                break;
            }
        }

    });

    client.write(responses.ready);

}).listen(port);


const responses = {
    fileOk: "150 File ok, about to open data connection.\n",

    ok: "200 OK.\n",
    ready: "220 Service ready for new user.\n",
    disconnected: "221 Disconnected.\n",
    closingControlConnection: "221 Service closing control connection.\n",
    actionSuccessful: "226 Closing data connection. Requested file action successful.\n",
    loggedIn: (username: string = "") => `230 "${username}" logged in.\n`,
    cwd: (dir: string = "/") => `257 "${dir}" is current directory\n`,

    passwordRequired: "331 Password required for username.\n",
    cantOpen: "425 Can't open data connection.\n",
    connectionClosed: "426 Connection closed; transfer aborted.\n",

    syntaxError: "501 Syntax error in parameters or arguments.\n",
    notImplemented: "502 Not implemented.\n",
    loginFailed: "530 User cannot log in.\n",
    fileUnavailable: "550 Requested action not taken. File unavailable.\n"
}