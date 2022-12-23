import { Message } from "node-nats-streaming";
import { OrderCreatedListener } from "../order-created-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { Ticket } from "../../../models/ticket";
import { OrderCreatedEvent, OrderStatus } from "@mert5432-ticket-app/common";
import mongoose from "mongoose";

const setup = async () => {
  // Create an instance of the listener
  const listener = new OrderCreatedListener(natsWrapper.client);
  // Create and save a ticket
  const ticket = Ticket.build({
    price: 100,
    title: "anyvalidtitle",
    userId: "whatever",
  });
  await ticket.save();

  // Create the fake data event

  const data: OrderCreatedEvent["data"] = {
    id: mongoose.Types.ObjectId.generate().toString("hex"),
    status: OrderStatus.Created,
    userId: "whatever",
    expiresAt: "whatever",
    version: 0,
    ticket: {
      id: ticket.id,
      price: ticket.price,
    },
  };

  // create a message function
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, ticket, data, msg };
};

it("sets the userID of the ticket", async () => {
  const { listener, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.orderId).toBeDefined();
  expect(updatedTicket!.orderId).toEqual(data.id);
});

it("acks te message", async () => {
  const { listener, ticket, data, msg } = await setup();
  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it("published a ticket updated event", async () => {
  const { listener, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const ticketUpdatedData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );

  expect(ticketUpdatedData.orderId).toEqual(data.id);
});
