import { User } from './index';

const net = require('net');
const path = require('path');
const fsPromises = require("fs").promises;

import { ls, saveFile } from './files';

const storageDir = "storage";


const getCurrentPath = (clientCd: string, commandValue: string) => {
    let currentPath = path.join(storageDir, clientCd);
    if (commandValue)
        currentPath = path.join(storageDir, clientCd, commandValue);
    return currentPath;
}


const manageClientRequest = async (client: any, users: User[], command: string, value: string) => {

    console.log({ value, command });

    switch (command) {
        case "OPTS": {
            client.write(responses.ok);
            client.cd = "";
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
        case "PWD": {
            client.write(responses.pwd(getCurrentPath(client.cd, "")));
            break;
        }
        case "XMKD":
        case "MKD": {
            if (client.loginSuccessful) {
                const currentPath = getCurrentPath(client.cd, value);
                fsPromises.mkdir(currentPath, { recursive: true });
                client.write(responses.ok);
            }
            else
                client.write(responses.loginFailed);

            break;
        }
        case "XRMD":
        case "RMD": {
            if (client.loginSuccessful) {
                const currentPath = getCurrentPath(client.cd, value);

                try { 
                    await fsPromises.unlink(currentPath);
                    client.write(responses.ok);
                } 
                catch (e) { 
                    console.log({e});

                    switch (e.code) {
                        case "ENOENT": {
                            client.write(responses.fileUnavailable);
                            break;
                        }
                        case "EPERM": {
                            try {
                                await fsPromises.rmdir(currentPath);
                                client.write(responses.ok);
                            }
                            catch(e2) {
                                console.log({e2});
                                if(e2.code === "ENOTEMPTY")
                                    client.write(responses.directoryNotEmpty);
                                else
                                    client.write(responses.actionNotTaken);
                            }
                            break;
                        }
                        default: {
                            client.write(responses.actionNotTaken);
                        }
                    }
                };

            }
            else
                client.write(responses.loginFailed);

            break;
        }
        case "NLST": {
            client.write(responses.fileOk);
            const { host, port } = parsedSocketData(client.port);
            const currentPath = getCurrentPath(client.cd, value);

            const connection = net.createConnection({ port, host }, () => {
                ls(currentPath).then((dirContent: string[]) => {
                    const lsResponse = (dirContent.length > 0 ? dirContent.reduce((a: string, b: string) => (a + "\n" + b)) : "") + "\n";
                    console.log({ dirContent, currentPath, lsResponse });
                    connection.write(lsResponse);
                    connection.end();
                });
            });
            connection.on('end', () => {
                client.write(responses.actionSuccessful);
            });

            break;
        }
        case "CWD": {
            client.cd = path.join(client.cd, value);
            client.write(responses.ok);
            break;
        }
        case "STOR": {
            if (client.loginSuccessful) {
                client.write(responses.fileOk);
                const { host, port } = parsedSocketData(client.port);

                const connection = net.createConnection({ port, host }, () => {
                    console.log("STOR");
                });
                connection.on('data', (data: any) => {
                    console.log({ data, command, value });

                    const currentPath = getCurrentPath(client.cd, value);
                    saveFile(data, currentPath);
                    connection.end();
                    //TODO: save to file
                });
                connection.on('end', () => {
                    client.write(responses.actionSuccessful);
                });
            }
            else
                client.write(responses.loginFailed);

            break;
        }
        case "RETR": {
            const { host, port } = parsedSocketData(client.port);

            const connection = net.createConnection({ port, host }, () => {
                console.log("RETR");

                const currentPath = getCurrentPath(client.cd, value);
                fsPromises.readFile(currentPath).then((fileContent: Buffer) => {
                    client.write(responses.fileOk);
                    connection.write(fileContent);
                    connection.end();
                }).catch((error: any) => {
                    client.write(responses.fileUnavailable);
                });
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
}


const parsedSocketData = (rawData: string) => {
    const splittedPort = rawData.split(",");
    const host = splittedPort[0] + "." + splittedPort[1] + "." + splittedPort[2] + "." + splittedPort[3];
    const port = (parseInt(splittedPort[4]) * 256) + parseInt(splittedPort[5]);
    return { host, port };
};


const isPathValid = (somePath: string, username: string) => {
    if (!path.isAbsolute(somePath) || somePath.split(path.sep)[0] !== storageDir) {
        return true;
    }
    else return false;
};


const responses = {
    fileOk: "150 File ok, about to open data connection.\n",

    ok: "200 OK.\n",
    ready: "220 Service ready for new user.\n",
    disconnected: "221 Disconnected.\n",
    closingControlConnection: "221 Service closing control connection.\n",
    actionSuccessful: "226 Closing data connection. Requested file action successful.\n",
    loggedIn: (username: string = "") => `230 "${username}" logged in.\n`,
    pwd: (dir: string = "/") => `257 "${dir}" is current directory\n`,

    passwordRequired: "331 Password required for username.\n",
    cantOpen: "425 Can't open data connection.\n",
    connectionClosed: "426 Connection closed; transfer aborted.\n",
    actionNotTaken: "450 Requested file action not taken.\n",

    syntaxError: "501 Syntax error in parameters or arguments.\n",
    notImplemented: "502 Not implemented.\n",
    loginFailed: "530 User not log in.\n",
    fileUnavailable: "550 Requested action not taken. File unavailable.\n",

    directoryNotEmpty: "10066 Directory not empty.\n"
}


export { responses, manageClientRequest, storageDir };