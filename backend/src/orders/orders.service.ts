import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';

@Injectable()
export class OrdersService {
  constructor(@InjectModel(Order.name) private orderModel: Model<OrderDocument>) {}

  async create(data: Partial<Order>): Promise<Order> {
    const created = new this.orderModel(data);
    return created.save();
  }

  async findById(id: string) {
    return this.orderModel.findById(id).exec();
  }

  async findByUser(userId: string) {
    return this.orderModel.find({ 'customer.id': userId }).exec();
  }

  async findAll() {
    return this.orderModel.find().exec();
  }

  async updateStatus(id: string, status: string) {
    return this.orderModel.findByIdAndUpdate(id, { status }, { new: true }).exec();
  }

  async updatePaymentStatus(id: string, paymentStatus: string) {
    return this.orderModel.findByIdAndUpdate(id, { paymentStatus }, { new: true }).exec();
  }

  async startPayment(id: string, phone: string) {
    return this.orderModel.findByIdAndUpdate(
      id,
      { paymentStatus: 'processing', paymentRequest: { phone, requestedAt: new Date() } },
      { new: true },
    ).exec();
  }
}
