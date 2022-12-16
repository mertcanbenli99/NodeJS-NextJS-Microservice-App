import {
  Publisher,
  Subjects,
  TicketUpdatedEvent,
} from "@mert5432-ticket-app/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}
