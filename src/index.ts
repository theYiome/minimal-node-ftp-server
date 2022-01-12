import { loadJSON } from './files';
import * as fsPromises from 'node:fs/promises';

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


const telnet = require('telnet');
telnet.createServer(function (client: any) {

    // make unicode characters work properly
    client.do.transmit_binary()

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
                const currentUser = users.find(user => user.username === client.username);
                const passwordCorrect = currentUser ? currentUser.password === value : false;
                if(currentUser && passwordCorrect) {
                    client.write(responses.loggedIn);
                    client.loginSuccessful = true;
                }
                else {
                    client.write(responses.loginFailed);
                    client.loginSuccessful = false; 
                }
                break;
            }
            case "PORT": {
                client.write(responses.ok);
                client.port = value;
                break;
            }
            case "XPWD": {
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
                client.write(responses.ok);
                break;
            }
            case "RETR": {
                client.write(responses.ok);
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

}).listen(21);


const responses = {
    fileOk: "150 File ok, about to open data connection.\n",

    ok: "200 OK.\n",
    ready: "220 Service ready for new user.\n",
    disconnected: "221 Disconnected.\n",
    closingControlConnection: "221 Service closing control connection.\n",
    actionSuccessful: "226 Closing data connection. Requested file action successful.\n",
    loggedIn: "230 Logged in.\n",

    passwordRequired: "331 Password required for username.\n",
    cantOpen: "425 Can't open data connection.\n",
    connectionClosed: "426 Connection closed; transfer aborted.\n",

    syntaxError: "501 Syntax error in parameters or arguments.\n",
    notImplemented: "502 Not implemented.\n",
    loginFailed: "530 User cannot log in.\n",
    fileUnavailable: "550 Requested action not taken. File unavailable.\n"
}