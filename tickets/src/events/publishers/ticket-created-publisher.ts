import {
  Publisher,
  Subjects,
  TicketCreatedEvent,
} from "@mert5432-ticket-app/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}
