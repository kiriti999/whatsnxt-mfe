import { Document, Model } from "mongoose";
import { BaseEntity } from "@whatsnxt/core-types";

export class BaseService<T extends BaseEntity & Document> {
  protected model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async create(data: T): Promise<T> {
    const doc = new this.model(data);
    await doc.save();
    return doc;
  }

  async findById(id: string): Promise<T | null> {
    return this.model.findOne({ id }).exec();
  }

  async find(query: object = {}): Promise<T[]> {
    return this.model.find(query).exec();
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    return this.model.findOneAndUpdate({ id }, data, { new: true }).exec();
  }

  async delete(id: string): Promise<T | null> {
    return this.model
      .findOneAndDelete({ id })
      .exec() as unknown as Promise<T | null>;
  }
}
