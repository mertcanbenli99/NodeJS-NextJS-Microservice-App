import { OrderStatus } from "@mert5432-ticket-app/common";
import mongoose from "mongoose";
import request from "supertest";
import { app } from "../../app";
import { Order } from "../../models/order";

it("throws an error if the route handler is not found", async () => {
  const response = await request(app).post("/api/payments").send({});

  expect(response.status).not.toEqual(404);
});

it("throws an error if user is not authenticated", async () => {
  await request(app).post("/api/payments").send({}).expect(401);
});

it("returns a status other than 401 if the user is signed in", async () => {
  const response = await request(app)
    .post("/api/payments")
    .set("Cookie", global.signin())
    .send({});

  expect(response.status).not.toEqual(401);
});

it("returns an error if token and orderId is not provided", async () => {
  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signin())
    .send({
      orderId: "whatever",
    })
    .expect(400);

  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signin())
    .send({
      token: "whatever",
    })
    .expect(400);
});

it("returns a 404 when purchasing an order that does not exist", async () => {
  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signin())
    .send({
      token: "aksldalsknda",
      orderId: mongoose.Types.ObjectId.generate().toString("hex"),
    })
    .expect(404);
});

it("returns a 401 when purchasing an order that belongs to another user", async () => {
  const order = Order.build({
    id: mongoose.Types.ObjectId.generate().toString("hex"),
    userId: mongoose.Types.ObjectId.generate().toString("hex"),
    version: 0,
    price: 20,
    status: OrderStatus.Created,
  });

  await order.save();

  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signin())
    .send({
      token: "aksldalsknda",
      orderId: order.id,
    })
    .expect(401);
});

it("throws a bad request error if user tries to buy a cancelled/expired order", async () => {
  const userId = mongoose.Types.ObjectId.generate().toString("hex");

  const order = Order.build({
    id: userId,
    userId: mongoose.Types.ObjectId.generate().toString("hex"),
    version: 0,
    price: 20,
    status: OrderStatus.Cancelled,
  });

  await order.save();

  await request(app)
    .post("api/payments")
    .set("Cookie", global.signin(userId))
    .send({
      orderId: order.id,
      token: "aaaa",
    })
    .expect(404);
});
