import mongoose from "mongoose";
import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
const id = new mongoose.Types.ObjectId().toHexString();
it("returns a status code of 401 if user is not authorized", async () => {
  await request(app).get("/api/orders/id").send({}).expect(401);
});

it("returns a bad request error if not correct mongoDB objectId is provided ", async () => {
  await request(app)
    .get("/api/orders/aaa")
    .set("Cookie", global.signin())
    .send({})
    .expect(400);
});

it("returns an error if the ticket is not found", async () => {
  await request(app)
    .get(`/api/orders/${id}`)
    .set("Cookie", global.signin())
    .send({})
    .expect(404);
});

it("fetches the order with associated ticket", async () => {
  const ticket = Ticket.build({
    title: "concert",
    price: 20,
  });

  await ticket.save();

  const user = global.signin();

  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", user)
    .send({
      ticketId: ticket.id,
    })
    .expect(201);

  const { body: fetcchedOrder } = await request(app)
    .get(`/api/orders/${order.id}`)
    .set("Cookie", user)
    .send()
    .expect(200);

  expect(fetcchedOrder.id).toEqual(order.id);
});

it("returns an error if one user tries to fetch another users order", async () => {
  const ticket = Ticket.build({
    title: "concert",
    price: 20,
  });

  await ticket.save();

  const user = global.signin();

  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", user)
    .send({
      ticketId: ticket.id,
    })
    .expect(201);

  await request(app)
    .get(`/api/orders/${order.id}`)
    .set("Cookie", global.signin())
    .send()
    .expect(401);
});
