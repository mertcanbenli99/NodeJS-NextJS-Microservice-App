import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
import { natsWrapper } from "../../nats-wrapper";

it("returns a 404 if the provided id in request does not exists in database", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .send({
      title: "validtitle",
      price: 100,
    })
    .set("Cookie", global.signin())
    .expect(404);
});

it("returns a 401 user is not authenticated", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .send({
      title: "validtitle",
      price: 100,
    })
    .expect(401);
});

it("returns a 401 if the user does not own the requested ticket", async () => {
  // Firstly create a ticket with a associated user
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({
      title: "anyvalidtitle",
      price: 100,
    });
  // Then try to access another users's ticket via randomly generated id by global.signin function
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", global.signin())
    .send({
      title: "anyanothervalidtitle",
      price: 2000,
    })
    .expect(401);
});

it("returns a 400 if user provides an invalid title or price", async () => {
  const cookie = global.signin();

  // Create a ticket
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title: "anyvalidtitle",
      price: 100,
    });

  // Try to update the ticket with some invalid values.
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "",
      price: 20,
    })
    .expect(400);
  // try to do same with the invalid price

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "somevalidtitle",
      price: -20,
    })
    .expect(400);
});

it("returns a 404 if the provided id in request does not exists in database", async () => {
  const cookie = global.signin();
  // Firstly create a ticket to update.
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title: "anyvalidtitle",
      price: 100,
    });

  // Try to edit the ticket with valid request parameters.
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "A new Title",
      price: 200,
    })
    .expect(200);

  // fetch the new ticket to compare with updated values.
  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send();

  expect(ticketResponse.body.title).toEqual("A new Title");
  expect(ticketResponse.body.price).toEqual(200);
});

it("publishes an event", async () => {
  const cookie = global.signin();
  // Firstly create a ticket to update.
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title: "anyvalidtitle",
      price: 100,
    });

  // Try to edit the ticket with valid request parameters.
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "A new Title",
      price: 200,
    })
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
