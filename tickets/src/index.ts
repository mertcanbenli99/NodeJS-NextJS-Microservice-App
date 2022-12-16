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

  try {
    await natsWrapper.connect(
      "ticketing",
      "randomvaluenow",
      "http://nats-srv:4222"
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
  console.log("tickets service v4");
  console.log("listening on port 3000");
});

start();
