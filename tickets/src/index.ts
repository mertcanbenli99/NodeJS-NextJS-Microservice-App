import mongoose from "mongoose";
import { app } from "./app";
import { natsWrapper } from "./nats-wrapper";

const start = async () => {
  if (!process.env.jwt) {
    throw new Error("Jwt key must be defined");
  }
  if (!process.env.MONGO_URI) {
    throw new Error("mongo uri must be defined");
  }
  if (!process.env.NATS_CLIENT_ID) {
    throw new Error("nats client id must be defined");
  }
  if (!process.env.NATS_URL) {
    throw new Error("nats url must be defined");
  }
  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error("nats cluster id must be defined");
  }

  try {
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL
    );
    natsWrapper.client.on("close", () => {
      console.log("nats connection closed!");
      process.exit();
    });
    process.on("SIGINT", () => natsWrapper.client.close());
    process.on("SIGTERM", () => natsWrapper.client.close());

    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to mongodb");
  } catch (err) {
    console.error(err);
  }
};

app.listen(3000, () => {
  console.log("tickets service v5");
  console.log("listening on port 3000");
});

start();
