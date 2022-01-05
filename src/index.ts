const telnet = require('telnet');

telnet.createServer(function (client: any) {

    // make unicode characters work properly
    client.do.transmit_binary()

    // listen for the actual data from the client
    client.on('data', function (b: Buffer) {
        console.log(b.toString())
        client.write(b)
    })

    client.write('This is correct data!\n\n')

}).listen(21);