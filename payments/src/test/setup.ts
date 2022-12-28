import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

declare global {
  var signin: (id?: string) => string[];
}

jest.mock("../nats-wrapper");

let mongo: any;
process.env.STRIPE_KEY =
  "sk_test_51MIuG0LS1SxIGjeJyYF3gFrzkAlpdwW5m1CMif825r56zJUuZVXvoBTpmVc0ckwZmlonVxsQJR2lKojq54YliK2700E0ePj3d8";
beforeAll(async () => {
  process.env.jwt = "mertsecret";
  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();

  await mongoose.connect(mongoUri);
});

beforeEach(async () => {
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();

  for (let colletion of collections) {
    await colletion.deleteMany({});
  }
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});

global.signin = (id?: string) => {
  // Build a JWT payload.  { id, email }
  const payload = {
    id: id || new mongoose.Types.ObjectId().toHexString(), // Generate a random id for further testing purposes rather than hard-coded id.
    email: "test@test.com",
  };

  // Create the JWT!
  const token = jwt.sign(payload, process.env.jwt!);

  // Build session Object. { jwt: MY_JWT }
  const session = { jwt: token };

  // Turn that session into JSON
  const sessionJSON = JSON.stringify(session);

  // Take JSON and encode it as base64
  const base64 = Buffer.from(sessionJSON).toString("base64");

  // return a string thats the cookie with the encoded data
  return [`session=${base64}`];
};
