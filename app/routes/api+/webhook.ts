import { subscriptionRepository } from '#app/infra/repository'
import {
  sendSubscriptionErrorEmail,
  sendSubscriptionSuccessEmail,
} from '#app/modules/email/templates/subscription-email'
import { PLANS } from '#app/modules/stripe/plans'
import { stripe } from '#app/modules/stripe/stripe.server'
import { ERRORS } from '#app/utils/constants/errors'
import { prisma } from '#app/utils/db.server'
import type { ActionFunctionArgs } from '@remix-run/node'
import { z } from 'zod'

export const ROUTE_PATH = '/api/webhook' as const

/**
 * Gets and constructs a Stripe event signature.
 *
 * @throws An error if Stripe signature is missing or if event construction fails.
 * @returns The Stripe event object.
 */
async function getStripeEvent(request: Request) {
  const secret =
    process.env.NODE_ENV === 'development'
      ? process.env.DEV_STRIPE_WEBHOOK_ENDPOINT
      : process.env.PROD_STRIPE_WEBHOOK_ENDPOINT
  if (!secret) {
    throw new Error(`Stripe - ${ERRORS.ENVS_NOT_INITIALIZED}`)
  }

  try {
    const signature = request.headers.get('Stripe-Signature')
    if (!signature) throw new Error(ERRORS.STRIPE_MISSING_SIGNATURE)
    const payload = await request.text()
    const event = stripe.webhooks.constructEvent(payload, signature, secret)
    return event
  } catch (err: unknown) {
    console.log(err)
    throw new Error(ERRORS.STRIPE_SOMETHING_WENT_WRONG)
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const event = await getStripeEvent(request)

  try {
    switch (event.type) {
      /**
       * Occurs when a Checkout Session has been successfully completed.
       */
      case 'checkout.session.completed': {
        const session = event.data.object
        const { customer: customerId, subscription: subscriptionId } = z
          .object({ customer: z.string(), subscription: z.string() })
          .parse(session)

        const user = await prisma.user.findUnique({ where: { customerId } })
        if (!user) throw new Error(ERRORS.SOMETHING_WENT_WRONG)

        const subscription = await stripe.subscriptions.retrieve(subscriptionId)

        const planId = String(subscription.items.data[0].plan.product)
        const priceId = String(subscription.items.data[0].price.id)
        const plan = await prisma.plan.findUniqueOrThrow({ where: { id: planId } })

        await prisma.subscription.update({
          where: { userId: user.id },
          data: {
            id: subscription.id,
            plan: { connect: { id: planId } },
            price: { connect: { id: priceId } },
            status: subscription.status,
            usersCount: plan.usersCount,
            customVoices: plan.customVoices,
            availableCredits: plan.charactersPerMonth,
            interval: String(subscription.items.data[0].plan.interval),
            currentPeriodStart: subscription.current_period_start,
            currentPeriodEnd: subscription.current_period_end,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
          },
        })

        await sendSubscriptionSuccessEmail({ email: user.email, subscriptionId })

        // Cancel free subscription. — User upgraded to a paid plan.
        // Not required, but it's a good practice to keep just a single active plan.
        const subscriptions = (
          await stripe.subscriptions.list({ customer: customerId })
        ).data.map(({ items }) => items)

        if (subscriptions.length > 1) {
          const freeSubscription = subscriptions.find(({ data }) =>
            data.some((item) => item.price.product === PLANS.FREE),
          )
          if (freeSubscription) {
            await stripe.subscriptions.cancel(freeSubscription?.data[0].subscription)
          }
        }

        // TODO: cancel previous subscription, not necessarily the free one.

        // const subscriptionsList = await stripe.subscriptions.list({
        // 	customer: customerId,
        // })
        // const freeSubscriptions = subscriptionsList.data
        // 	.map(subscription => {
        // 		return subscription.items.data.find(
        // 			item => item.price.product === PLANS.FREE,
        // 		)
        // 	})
        // 	.filter(item => item !== undefined)

        // if (freeSubscriptions[0]) {
        // 	await stripe.subscriptions.cancel(freeSubscriptions[0].subscription)
        // }

        return new Response(null)
      }

      /**
       * Occurs when a Stripe subscription has been updated.
       * E.g. when a user upgrades or downgrades their plan.
       */
      case 'customer.subscription.updated': {
        const subscription = event.data.object
        const { customer: customerId } = z
          .object({ customer: z.string() })
          .parse(subscription)

        const user = await prisma.user.findUnique({ where: { customerId } })
        if (!user) throw new Error(ERRORS.SOMETHING_WENT_WRONG)

        const planId = String(subscription.items.data[0].plan.product)
        const priceId = String(subscription.items.data[0].price.id)
        const plan = await prisma.plan.findUniqueOrThrow({ where: { id: planId } })

        await prisma.subscription.update({
          where: { userId: user.id },
          data: {
            id: subscription.id,
            plan: { connect: { id: planId } },
            price: { connect: { id: priceId } },
            status: subscription.status,
            usersCount: plan.usersCount,
            customVoices: plan.customVoices,
            availableCredits: plan.charactersPerMonth,
            // TODO - WARN: careful here. Users can restart their monthly credits if they update and, in sequence, downgrade their plan
            // TODO: create CRON to restart availableCredits every month. Or at every subscription month renewal. Or every 1 month after subscription date.
            interval: String(subscription.items.data[0].plan.interval),
            currentPeriodStart: subscription.current_period_start,
            currentPeriodEnd: subscription.current_period_end,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
          },
        })

        return new Response(null)
      }

      /**
       * Occurs whenever a customer’s subscription ends.
       */
      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        const { id, status } = z
          .object({ id: z.string(), status: z.string() })
          .parse(subscription)

        await subscriptionRepository.updateSubscription(id, { status })

        return new Response(null)
      }
    }
  } catch (err: unknown) {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object

        const { customer: customerId, subscription: subscriptionId } = z
          .object({ customer: z.string(), subscription: z.string() })
          .parse(session)

        const user = await prisma.user.findUnique({ where: { customerId } })
        if (!user) throw new Error(ERRORS.STRIPE_SOMETHING_WENT_WRONG)

        await sendSubscriptionErrorEmail({ email: user.email, subscriptionId })
        return new Response(null)
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object

        const { id: subscriptionId, customer: customerId } = z
          .object({ id: z.string(), customer: z.string() })
          .parse(subscription)

        const user = await prisma.user.findUnique({ where: { customerId } })
        if (!user) throw new Error(ERRORS.STRIPE_SOMETHING_WENT_WRONG)

        await sendSubscriptionErrorEmail({ email: user.email, subscriptionId })
        return new Response(null)
      }
    }

    throw err
  }

  return new Response(null)
}
