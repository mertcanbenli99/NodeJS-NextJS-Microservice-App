import mongoose from "mongoose";
import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import { Order, OrderStatus } from "../../models/order";
import { natsWrapper } from "../../nats-wrapper";

it("returns a 401 if user is not authenticated", async () => {
  await request(app).delete("/api/orders/aaa").send({}).expect(401);
});

it("returns a bad request error if user provided invalid id type", async () => {
  const response = await request(app)
    .delete("/api/orders/aaaa")
    .set("Cookie", global.signin())
    .expect(400);

  expect(response.body.errors[0].message).toEqual("Invalid id");
});

it("returns an error if requested order is not found", async () => {
  const id = mongoose.Types.ObjectId.generate().toString("hex");
  const response = await request(app)
    .delete(`/api/orders/${id}`)
    .set("Cookie", global.signin())
    .send({})
    .expect(404);
});

it("returns a 401 if requested order is found but the order does not belong to currentUser", async () => {
  // create a ticket
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId.generate().toString("hex"),
    title: "anyvalidtitle",
    price: 10,
  });

  await ticket.save();
  // create a user session
  const user = global.signin();

  // create a valid order with current user session
  const { body: orderOne } = await request(app)
    .post("/api/orders")
    .set("Cookie", user)
    .send({
      ticketId: ticket.id,
    })
    .expect(201);

  // try to delete/modify another user's order.
  await request(app)
    .delete(`/api/orders/${orderOne.id}`)
    .set("Cookie", global.signin())
    .expect(401);
});

it("successfully marks an orderStatus as cancelled", async () => {
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId.generate().toString("hex"),
    title: "anyvalidtitle",
    price: 10,
  });

  await ticket.save();

  const user = global.signin();

  const { body: OrderOne } = await request(app)
    .post("/api/orders")
    .set("Cookie", user)
    .send({
      ticketId: ticket.id,
    })
    .expect(201);

  await request(app)
    .delete(`/api/orders/${OrderOne.id}`)
    .set("Cookie", user)
    .send({})
    .expect(204);

  // make sure the order modified as cancelled
  const updatedOrder = await Order.findById(OrderOne.id);

  expect(updatedOrder?.status).toEqual(OrderStatus.Cancelled);
});

it("emit an order:cancelled event if the order is successfully cancelled", async () => {
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId.generate().toString("hex"),
    title: "anyvalidtitle",
    price: 10,
  });

  await ticket.save();

  const user = global.signin();

  const { body: OrderOne } = await request(app)
    .post("/api/orders")
    .set("Cookie", user)
    .send({
      ticketId: ticket.id,
    })
    .expect(201);

  await request(app)
    .delete(`/api/orders/${OrderOne.id}`)
    .set("Cookie", user)
    .send({})
    .expect(204);

  expect(natsWrapper.client.publish).toHaveBeenCalledTimes(2);
});
