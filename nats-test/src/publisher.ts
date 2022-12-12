import nats from "node-nats-streaming";

console.clear();

const stan = nats.connect("ticketing", "abc", {
  url: "http://localhost:4222",
});

stan.on("connect", () => {
  console.log("Connection with NATS is established");

  const data = JSON.stringify({
    id: "1111",
    title: "concert",
    price: 20,
  });

  stan.publish("ticket:created", data, () => {
    console.log("event published");
  });
});
