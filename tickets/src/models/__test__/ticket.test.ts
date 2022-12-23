import { Ticket } from "../ticket";

it("it implements optimistic concurrency control to track events on", async () => {
  // Create an instace of a ticket
  const ticket = Ticket.build({
    title: "anyvalidtitle",
    price: 5,
    userId: "123",
  });

  // save ticket to the database
  await ticket.save();
  // fetch the ticket twice
  const firstInstace = await Ticket.findById(ticket.id);
  const secondInstance = await Ticket.findById(ticket.id);

  // make two seperate changes to the tickets we fetched
  firstInstace!.set({ price: 10 });
  secondInstance!.set({ price: 15 });

  // save the first fetched ticket
  await firstInstace!.save();
  // save the second fetched ticket and expect an error

  try {
    await secondInstance!.save();
  } catch (err) {
    return;
  }

  throw new Error("Should not reach this point");
});

it("increments the version number on multiple saves ", async () => {
  const ticket = Ticket.build({
    price: 10,
    title: "anyvlaidtitle",
    userId: "121",
  });

  await ticket.save();

  expect(ticket.version).toEqual(0);
  await ticket.save();

  expect(ticket.version).toEqual(1);
  await ticket.save();
  expect(ticket.version).toEqual(2);
});
