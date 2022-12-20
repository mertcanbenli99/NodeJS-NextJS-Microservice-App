import {
  NotFoundError,
  requireAuth,
  validateRequest,
  NotAuthorizedError,
  OrderStatus,
} from "@mert5432-ticket-app/common";
import express, { Request, Response } from "express";
import { param } from "express-validator";
import mongoose from "mongoose";
import { Order } from "../models/order";

const router = express.Router();

router.delete(
  "/api/orders/:orderId",
  requireAuth,
  [
    param("orderId")
      .custom((input) => mongoose.Types.ObjectId.isValid(input))
      .withMessage("Invalid id"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      throw new NotFoundError();
    }
    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }
    order.status = OrderStatus.Cancelled;
    await order.save();

    // publish an event saying order:cancelled

    res.status(204).send({});
  }
);

export { router as deleteOrderRouter };
