import express, { Request, Response } from "express";
import {
  NotAuthorizedError,
  NotFoundError,
  requireAuth,
  validateRequest,
} from "@mert5432-ticket-app/common";
import { Order } from "../models/order";
import { Ticket } from "../models/ticket";
import { param } from "express-validator";
import mongoose from "mongoose";

const router = express.Router();

router.get(
  "/api/orders/:orderId",
  requireAuth,
  [
    param("orderId").custom((input: string) =>
      mongoose.Types.ObjectId.isValid(input)
    ),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.orderId).populate("ticket");

    if (!order) {
      throw new NotFoundError();
    }
    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    res.send(order);
  }
);

export { router as showOrderRouter };
