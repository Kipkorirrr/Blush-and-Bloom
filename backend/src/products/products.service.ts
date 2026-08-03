import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';

@Injectable()
export class ProductsService {
  constructor(@InjectModel(Product.name) private productModel: Model<ProductDocument>) {}

  async create(data: Partial<Product>): Promise<Product> {
    const created = new this.productModel(data);
    return created.save();
  }

  async findAll() {
    return this.productModel.find().exec();
  }

  async findById(id: string) {
    return this.productModel.findById(id).exec();
  }

  async findManyByIds(ids: string[]) {
    const objectIds = ids
      .filter((id) => Types.ObjectId.isValid(id))
      .map((id) => new Types.ObjectId(id));

    if (objectIds.length === 0) {
      return [];
    }

    return this.productModel.find({ _id: { $in: objectIds } }).exec();
  }

  async update(id: string, data: Partial<Product>) {
    return this.productModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async remove(id: string) {
    return this.productModel.findByIdAndDelete(id).exec();
  }
}
