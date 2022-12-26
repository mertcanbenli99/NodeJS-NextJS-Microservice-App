import mongoose, { Mongoose } from "mongoose";

interface PaymentAttributtes {
  stripeId: string;
  orderId: string;
}

interface PaymentDocument extends mongoose.Document {
  stripeId: string;
  orderId: string;
}

interface PaymentModel extends mongoose.Model<PaymentDocument> {
  build(attributes: PaymentAttributtes): PaymentDocument;
}

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      required: true,
      type: String,
    },
    stripeId: {
      required: true,
      type: String,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

paymentSchema.statics.build = (attributes: PaymentAttributtes) => {
  return new Payment(attributes);
};

const Payment = mongoose.model<PaymentDocument, PaymentModel>(
  "Payment",
  paymentSchema
);

export { Payment };
