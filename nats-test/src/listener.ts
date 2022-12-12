import nats, { Message } from "node-nats-streaming";
import { randomBytes } from "crypto";

console.clear();

const stan = nats.connect("ticketing", randomBytes(4).toString("hex"), {
  url: "http://localhost:4222",
});

stan.on("connect", () => {
  console.log("Connection established");

  stan.on("close", () => {
    console.log("nats is going to sleep");
    process.exit();
  });

  const options = stan.subscriptionOptions().setManualAckMode(true);

  const subscription = stan.subscribe(
    "ticket:created",
    "listenerQueueGroup",
    options
  );

  subscription.on("message", (message: Message) => {
    const data = message.getData();

    if (typeof data === "string") {
      console.log(
        `Received event #${message.getSequence()}, with data: ${data}}`
      );
    }
    message.ack();
  });
});

process.on("SIGINT", () => stan.close());
process.on("SIGTERM", () => stan.close());
