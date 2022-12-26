import {
  PaymentCreatedEvent,
  Publisher,
  Subjects,
} from "@mert5432-ticket-app/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
}
