import { prisma } from '#app/utils/db.server.js'
import { type Subscription } from '@prisma/client'

export default interface SubscriptionRepository {
  getActiveSubscription(userId: string): Promise<Subscription | null>
  saveSubscription(subscription: Subscription): Promise<void>
  updateSubscription(id: string, subscription: Partial<Subscription>): Promise<void>
  // hasActiveRideByPassengerId(passengerId: string): Promise<boolean>
  // getRideById(rideId: string): Promise<Ride>
}

export class SubscriptionRepositoryOrm implements SubscriptionRepository {
  async getActiveSubscription(userId: string): Promise<Subscription | null> {
    return prisma.subscription.findUnique({ where: { userId: userId, status: 'active' } })
  }

  async saveSubscription(subscription: Subscription): Promise<void> {
    await prisma.subscription.create({ data: subscription })
  }

  async updateSubscription(
    id: string,
    subscription: Partial<Subscription>,
  ): Promise<void> {
    await prisma.subscription.update({ where: { id }, data: subscription })
  }
}

export const subscriptionRepository = new SubscriptionRepositoryOrm()
