import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { OrdersService } from './orders.service';
import { ProductsService } from '../products/products.service';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly productsService: ProductsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('user/:userId')
  async getByUser(@Param('userId') userId: string) {
    return this.ordersService.findByUser(userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get()
  async getAll() {
    return this.ordersService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Req() request: Request, @Body() body: { items: any[]; total: number; paymentMethod: string }) {
    const user = request.user as any;
    const productIds = body.items.map((item) => item.product);
    const products = await this.productsService.findManyByIds(productIds);

    const totalFromProducts = body.items.reduce((acc, item) => {
      const product = products.find((p) => p._id.toString() === item.product);
      return acc + (product?.price ?? 0) * item.quantity;
    }, 0);

    const orderTotal = totalFromProducts || body.total;
    return this.ordersService.create({
      items: body.items,
      total: orderTotal,
      paymentMethod: body.paymentMethod || 'mpesa',
      customer: {
        id: user.userId,
        email: user.email,
        name: user.name || user.email,
      },
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/pay')
  async payOrder(@Param('id') id: string, @Body('phone') phone: string, @Req() request: Request) {
    const user = request.user as any;
    const order = await this.ordersService.findById(id);
    if (!order) {
      return { message: 'Order not found' };
    }
    if (order.customer.id.toString() !== user.userId && user.role !== 'admin') {
      return { message: 'Not authorized to pay this order' };
    }
    return this.ordersService.startPayment(id, phone);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/payment')
  async confirmPayment(@Param('id') id: string, @Body('status') status: string, @Req() request: Request) {
    const user = request.user as any;
    const order = await this.ordersService.findById(id);
    if (!order) {
      return { message: 'Order not found' };
    }
    if (order.customer.id.toString() !== user.userId && user.role !== 'admin') {
      return { message: 'Not authorized to update this order' };
    }
    return this.ordersService.updatePaymentStatus(id, status);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.ordersService.updateStatus(id, status);
  }
}
