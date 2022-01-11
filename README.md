# minimal-node-ftp-server
Package `telnet` uses outdated dependecy - `buffer`.<br/>
There are some fixes required for `set()` and `get()` functions.

## Requirements
Please implement the FTP server in the form specified by the RFC https://datatracker.ietf.org/doc/html/rfc959#section-5 as Minimum Implementation with minor extensions. The server should meet the following requirements:

    It will be able to configure the port on which it will listen. It must be prepared to operate on a standard port: 21.

    It will work in active mode, ie it will establish a connection with the client to create a data channel.

    It will only support data type A (TYPE A) - ASCII.

    It will only support the Non-print (N) format.

    It will only support (F - FILE) files as data structures.

    It will only work in streaming mode (MODE S).

    He will respond to every client inquiry with the appropriate status code.

    It will respond appropriately to the client when trying to use any unsupported mode or commands.

    It will support text login and anonymous sessions.

    Anonymous sessions will only be able to access the "public" directories (and their contents) for each user. No other files will be visible.

    The logged in user will have access to and see all his files and directories and the "public" directories of all other users.

    The logged in user will not have access to other users' files.

    It will enable:

    uploading files to the server,

        downloading files from the server,

        deleting files from the server,

        creating and deleting directories on the server,

        printing the contents of any directory that the user has access to.

    It will log to the text file:

        each client login,

        each operation on files and directories with information about who performed it and the time.
        e.g. [date-time] [user] [action] [file]

    It will run without encryption (no TLS).

    It will work with the default Linux FTP text client (ftp command).

    It will serve multiple clients at once.

    It will be safe.

## Useful links

Przykładowy serwer do testowania: https://test.rebex.net/
