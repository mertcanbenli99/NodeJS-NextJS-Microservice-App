import request from "supertest";
import { app } from "../../app";

const createTicket = () => {
  return request(app).post("/api/tickets").set("Cookie", global.signin()).send({
    title: "validtitle",
    price: 100,
  });
};

it("Fetches a list of ticket objects.", async () => {
  // Firstly create a couple of tickets to emulate data.
  await createTicket();
  await createTicket();
  await createTicket();

  // then fetch the created tickets to test our index router.
  const response = await request(app).get("/api/tickets").send({}).expect(200);

  expect(response.body.length).toEqual(3);
});
