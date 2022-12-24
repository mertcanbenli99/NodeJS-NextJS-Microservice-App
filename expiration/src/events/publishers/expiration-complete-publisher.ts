import {
  ExpirationCompleteEvent,
  Publisher,
  Subjects,
} from "@mert5432-ticket-app/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
}
