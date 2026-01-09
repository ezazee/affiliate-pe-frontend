import { ObjectId } from 'mongodb';
import { Order } from './order';

export type CommissionStatus = 'pending' | 'approved' | 'paid' | 'cancelled';

export interface Commission {
  _id: ObjectId | string;
  id: string;
  affiliatorId: string;
  affiliateName: string;
  orderId: string;
  productName: string; // This might be redundant if order.product.name is available
  amount: number;
  status: CommissionStatus;
  date: Date;
  createdAt: Date;
  order?: Order;
}