import {
  OrderCancelledEvent,
  Listener,
  Subjects,
} from "@mert5432-ticket-app/common";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";
import { queueGroupName } from "./queue-group-name";
import { OrderStatus } from "@mert5432-ticket-app/common";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCancelledEvent["data"], message: Message) {
    const order = await Order.findByEvent(data);

    if (!order) {
      throw new Error("order not found");
    }
    order.set({ status: OrderStatus.Cancelled });
    await order.save();

    message.ack();
  }
}
