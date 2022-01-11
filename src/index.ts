const telnet = require('telnet');

telnet.createServer(function (client: any) {

    // make unicode characters work properly
    client.do.transmit_binary()

    // listen for the actual data from the client
    client.on('data', function (b: Buffer) {
        const data: string = b.toString();
        const command = data.split(" ")[0];
        const value = data.split(" ")[1];
        console.log({ data, command });

        switch (command) {
            case "OPTS": {
                client.write(responses.ready);
                break;
            }
            case "USER": {
                client.write(responses.passwordRequired);
                client.username = value;
                client.loginSuccessful = false;
                break;
            }
            case "PASS": {
                client.write(responses.loggedIn);
                client.loginSuccessful = true;
                break;
            }
            default: {
                console.log(client.username);
                client.write(responses.notImplemented); 
                break;
            }
        }

    });

}).listen(21);


const responses = {
    fileOk: "150 File ok, about to open data connection.\n",
    ok: "200 OK.\n",
    ready: "220 Service ready for new user.\n",
    closingControlConnection: "221 Service closing control connection.\n",
    actionSuccessful: "226 Closing data connection. Requested file action successful.\n",
    loggedIn: "230 Logged in.\n",
    passwordRequired: "331 Password required for username.\n",
    cantOpen: "425 Can't open data connection.\n",
    connectionClosed: "426 Connection closed; transfer aborted.\n",
    syntaxError: "501 Syntax error in parameters or arguments.\n",
    notImplemented: "502 Not implemented.\n",
    fileUnavailable: "550 Requested action not taken. File unavailable.\n"
}