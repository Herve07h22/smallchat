import net from "node:net";
import { green, mention, yellow } from "./color";

// client : nc 127.0.0.1 8124

const WELCOME_MESSAGE = yellow(
  "Welcome to smallchat 🔆 \r\nStart with /nick <your nickname> to join the chat.\r\n"
);

const NICKNAME_BEFORE_CHAT = yellow(
  "Before sending any message, start with /nick <your nickname> to join the chat.\r\n"
);

const SMALLCHAT_PORT = 8124;

class SmallChatClient {
  public state: "connected" | "disconnected" = "connected";
  public name?: string;

  constructor(private socket: net.Socket, private server: SmallChatServer) {
    this.logger("client connected");
    this.state = "connected";

    socket.on("end", () => {
      this.logger("client disconnected");
      this.state = "disconnected";
      this.name &&
        this.server.sendMessageToOthers(
          green(`${this.name} has left the chat 😿\r\n`),
          this.name
        );
    });

    socket.on("data", (data) =>
      this.processIncomingMessage(data.toLocaleString())
    );

    this.sendMessage(WELCOME_MESSAGE);
  }

  processIncomingMessage = (message: string) => {
    if (message.startsWith("/nick ")) {
      const name = message.slice(6).trim();
      if (this.server.nameAlreadyUsed(name)) {
        this.sendMessage(yellow(`${name} is already used ❌ \r\n`));
        return;
      }
      this.name = name;
      this.server.sendMessageToOthers(
        green(`${this.name} has joined the chat 🚀\r\n`),
        this.name
      );
      this.sendMessage(yellow(`Hello ${this.name} ! \r\n`));
      this.sendMessage(
        yellow(`${this.server.nbOfConnectedUsers()} user(s) connected. \r\n`)
      );
      return;
    }
    if (!this.name) {
      this.sendMessage(NICKNAME_BEFORE_CHAT);
      return;
    }
    this.server.sendMessageToOthers(
      green(`${this.name}>`) + message,
      this.name
    );
    this.logger(message);
  };

  sendMessage = (message: string) => {
    this.state === "connected" &&
      this.socket.write(mention(message, this.name));
  };

  logger = (log: string) => {
    console.log(`${this.name || "unknown"} | ${log}`);
  };
}

class SmallChatServer {
  private server: net.Server;
  private clients: SmallChatClient[] = [];
  constructor() {
    this.server = net.createServer((c) => {
      this.clients.push(new SmallChatClient(c, this));
    });

    this.server.on("error", (err) => {
      throw err;
    });

    this.server.listen(SMALLCHAT_PORT, () => {
      console.log("server started");
    });
  }

  sendMessageToOthers = (message: string, from: string) => {
    this.clients
      .filter((client) => client.name && client.name !== from)
      .forEach((client) => client.sendMessage(message));
  };

  nameAlreadyUsed(name: string) {
    return this.clients.some((client) => client.name === name);
  }

  nbOfConnectedUsers = () =>
    this.clients.filter((client) => client.state === "connected").length;
}

const server = new SmallChatServer();
