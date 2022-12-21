import {
  Publisher,
  OrderCreatedEvent,
  Subjects,
} from "@mert5432-ticket-app/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
}
