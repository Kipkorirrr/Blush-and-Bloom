import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderDocument = Order & Document;

@Schema()
class OrderItem {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  product!: Types.ObjectId;

  @Prop({ required: true })
  quantity!: number;
}

@Schema()
class PaymentRequest {
  @Prop()
  phone?: string;

  @Prop()
  requestedAt?: Date;
}

@Schema()
class CustomerInfo {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  id!: Types.ObjectId;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  email!: string;
}

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: [OrderItem], required: true })
  items!: OrderItem[];

  @Prop({ required: true })
  total!: number;

  @Prop({ required: true, default: 'pending' })
  status!: string;

  @Prop({ type: CustomerInfo, required: true })
  customer!: CustomerInfo;

  @Prop({ required: true, default: 'mpesa' })
  paymentMethod!: string;

  @Prop({ type: PaymentRequest, default: {} })
  paymentRequest?: PaymentRequest;

  @Prop({ default: 'pending' })
  paymentStatus!: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
