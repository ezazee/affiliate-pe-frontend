import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { Order, User, Commission } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();

    const orders = (await db.collection<Order>('orders').find({}).toArray()).map(order => ({ ...order, id: order._id.toString() }));
    const users = (await db.collection<User>('users').find({ role: 'affiliator' }).toArray()).map(user => ({ ...user, id: user._id.toString() }));
    const commissions = (await db.collection<Commission>('commissions').find({}).toArray()).map(commission => ({ ...commission, id: commission._id.toString() }));

    const totalRevenue = orders.reduce((sum, order) => sum + (order.shippingCost || 0), 0);
    const totalAffiliators = users.length;
    const totalOrders = orders.length;
    const totalCommissions = commissions.reduce((sum, commission) => sum + commission.amount, 0);

    return NextResponse.json({
      totalRevenue,
      totalAffiliators,
      totalOrders,
      totalCommissions,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
