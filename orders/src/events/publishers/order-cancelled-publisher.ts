import {
  OrderCancelledEvent,
  Subjects,
  Publisher,
} from "@mert5432-ticket-app/common/build/index";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
}
