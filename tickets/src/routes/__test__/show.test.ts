import request from "supertest";
import { app } from "../../app";

it("returns a 404 if the demanded ticket is not found ", async () => {
  await request(app)
    .get("/api/tickets/ticketwithimpossibleidentificationnumber")
    .send()
    .expect(404);
});

it("returns the ticket if the ticket is available ", async () => {
  // firstly create a valid ticket with a post request to new ticket router. Dont forget to mock our express session with cookie.
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({
      title: "validticketitle",
      price: 100,
    })
    .expect(201);

  // for second step look for the id of created ticket in response object. Then, if id is found search the mongodb database for via request parameters.
  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send()
    .expect(200);

  expect(ticketResponse.body.title).toEqual("validticketitle");
  expect(ticketResponse.body.price).toEqual(100);
});
