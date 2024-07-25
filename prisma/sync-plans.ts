import {
  INTERVALS,
  PRICING_PLANS,
  type Interval,
  type Plan,
  type PriceInterval,
} from '#app/modules/stripe/plans.js'
import { stripe } from '#app/modules/stripe/stripe.server'
import { PrismaClient } from '@prisma/client'
import { prisma } from '#app/utils/db.server'

const client = new PrismaClient()

async function syncPlans() {
  // Get existing Stripe products (plans)
  const products = await stripe.products.list({ active: true })

  const updateOrCreatePlans = Object.values(PRICING_PLANS).map(async (plan) => {
    const {
      id,
      name,
      description,
      charactersPerMonth,
      customVoices,
      usersCount,
      prices,
    } = plan
    if (products.data.length && products.data.some((product) => id === product.id)) {
      await stripe.products.update(id, {
        name,
        description,
        metadata: { charactersPerMonth, customVoices, usersCount },
      })
    } else {
      await stripe.products.create({
        id,
        name,
        description,
        metadata: { charactersPerMonth, customVoices, usersCount },
      })
    }

    const stripePrices = await getStripePrices(prices, id as Plan)
    const existingPlan = await prisma.plan.findUnique({ where: { id } })

    if (existingPlan) {
      // Update plan and prices
      await prisma.plan.update({
        where: { id },
        data: { description, charactersPerMonth, customVoices, usersCount },
      })
      await Promise.all(
        stripePrices.map(({ id, unit_amount, currency, recurring }) => {
          return prisma.price.update({
            where: { id },
            data: {
              amount: unit_amount ?? 0,
              currency: currency,
              interval: recurring?.interval ?? INTERVALS.ONETIME,
            },
          })
        }),
      )
    } else {
      // Store plan in the database.
      await prisma.plan.create({
        data: {
          id,
          name,
          description,
          usersCount,
          customVoices,
          charactersPerMonth,
          prices: {
            create: stripePrices.map((price) => ({
              id: price.id,
              amount: price.unit_amount ?? 0,
              currency: price.currency,
              interval: price.recurring?.interval ?? INTERVALS.ONETIME,
            })),
          },
        },
      })
    }
  })

  await Promise.all(updateOrCreatePlans)
}

async function getStripePrices(prices: PriceInterval, id: Plan) {
  const existingStripePrices = await stripe.prices.search({ query: `product:"${id}"` })

  if (existingStripePrices.data.length) return existingStripePrices.data

  // Format prices to match Stripe's API.
  const pricesByInterval = Object.entries(prices).flatMap(([interval, price]) => {
    return Object.entries(price).map(([currency, amount]) => ({
      interval,
      currency,
      amount,
    }))
  })

  // Create Stripe prices for the current product.
  return Promise.all(
    pricesByInterval.map(({ amount, currency, interval }) => {
      const recurring = isRecurring(interval) ? { recurring: { interval } } : {}
      return stripe.prices.create({
        product: id,
        currency: currency ?? 'brl',
        unit_amount: amount ?? 0,
        tax_behavior: 'inclusive',
        ...recurring,
      })
    }),
  )
}

function isRecurring(interval: string): interval is Exclude<Interval, 'oneTime'> {
  return interval !== INTERVALS.ONETIME
}

syncPlans()
  .then(() => {
    console.log('Plans updated successfully')
  })
  .catch((error) => {
    console.error('Error updating data:', error)
  })
  .finally(async () => {
    await client.$disconnect()
  })
