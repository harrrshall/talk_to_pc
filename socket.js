const net = require('net');
const { exec } = require('child_process');

class Command {
    constructor() {
        this.commands = {
            "terminal\n": this.commandTerminal,
            "google\n": this.commandGoogle,
            "youtube\n": this.commandYoutube,
            "calculator\n": this.commandCalculator,
            "suspend\n": this.commandSuspend
        };
    }

    commandTerminal() {
        exec('gnome-terminal');
    }

    commandGoogle() {
        exec('google-chrome');
    }

    commandYoutube() {
        exec('google-chrome https://www.youtube.com');
    }

    commandCalculator() {
        exec('gnome-calculator');
    }

    commandSuspend() {
        exec('sudo pm-suspend');
    }
}

class Server extends Command {
    constructor(ipAddress, portNumber) {
        super();
        this.ipAddress = ipAddress;
        this.portNumber = portNumber;
        this.pendingNum = 1;
        this.dataBuffer = "";
        this.str = Buffer.alloc(100);
        this.serverListeningSocket = null;
        this.serverConnectionSocket = null;
    }

    serverInit() {
        /*Creating the server socket*/
        this.serverListeningSocket = net.createServer();

        this.serverListeningSocket.listen(this.portNumber, this.ipAddress, () => {
            console.log(`Server listening on ${this.ipAddress}:${this.portNumber}`);
        });

        this.serverListeningSocket.on('connection', (socket) => {
            console.log('Client connected');
            this.serverConnectionSocket = socket;

            this.serverConnectionSocket.on('data', (data) => {
                this.dataBuffer = data.toString();
                console.log("Message from client:", this.dataBuffer);
                this.dataBuffer = this.dataBuffer.toLowerCase();
                this.serverExecuteCommand();
            });

            this.serverConnectionSocket.on('close', () => {
                console.log('Client disconnected');
                this.serverClose();
            });

            this.serverConnectionSocket.on('error', (err) => {
                console.error('Socket error:', err);
                this.serverClose();
            });
        });
    }

    serverSend(message) {
        this.serverConnectionSocket.write(message);
    }

    serverExecuteCommand() {
        const command = this.commands[this.dataBuffer];
        if (command) {
            command.call(this);
        } else {
            console.error('Invalid command received from client');
        }
    }

    serverClose() {
        if (this.serverListeningSocket) {
            this.serverListeningSocket.close(() => {
                console.log('Server closed');
            });
        }
    }
}

const myServer = new Server("192.168.1.21", 8080); 

myServer.serverInit();
