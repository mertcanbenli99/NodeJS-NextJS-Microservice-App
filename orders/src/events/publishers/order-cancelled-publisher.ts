import {
  Publisher,
  OrderCancelledEvent,
  Subjects,
} from "@mert5432-ticket-app/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
}
