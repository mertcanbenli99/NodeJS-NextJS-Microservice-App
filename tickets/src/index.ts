import mongoose from "mongoose";
import { app } from "./app";

const start = async () => {
  if (!process.env.jwt) {
    throw new Error("Jwt key must be defined");
  }
  if (!process.env.MONGO_URI) {
    throw new Error("mongo uri must be defined");
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to mongodb");
  } catch (err) {
    console.error(err);
  }
};

app.listen(3000, () => {
  console.log("auth service v4");
  console.log("listening on port 3000");
});

start();
