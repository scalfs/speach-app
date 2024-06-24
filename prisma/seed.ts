import { PRICING_PLANS } from '#app/modules/stripe/plans'
import { stripe } from '#app/modules/stripe/stripe.server'
import { prisma } from '#app/utils/db.server'
import { PrismaClient } from '@prisma/client'

const client = new PrismaClient()

async function seed() {
  /**
   * Users, Roles and Permissions.
   */
  const entities = ['user']
  const actions = ['create', 'read', 'update', 'delete']
  const accesses = ['own', 'any'] as const
  for (const entity of entities) {
    for (const action of actions) {
      for (const access of accesses) {
        await prisma.permission.create({ data: { entity, action, access } })
      }
    }
  }

  await prisma.role.create({
    data: {
      name: 'admin',
      permissions: {
        connect: await prisma.permission.findMany({
          select: { id: true },
          where: { access: 'any' },
        }),
      },
    },
  })
  await prisma.role.create({
    data: {
      name: 'user',
      permissions: {
        connect: await prisma.permission.findMany({
          select: { id: true },
          where: { access: 'own' },
        }),
      },
    },
  })
  await prisma.user.create({
    select: { id: true },
    data: {
      email: 'admin@admin.com',
      username: 'admin',
      roles: { connect: [{ name: 'admin' }, { name: 'user' }] },
    },
  })

  console.info(`🎭 User roles and permissions has been successfully created.`)

  /**
   * Stripe Products.
   */
  // const products = await stripe.products.list({
  //   limit: 3,
  // })

  // if (products?.data?.length && products.data.filter(({ active }) => active).length) {
  //   console.info(`📦 Stripe Products has been successfully created.`)
  //   return true
  // }

  const seedProducts = Object.values(PRICING_PLANS).map(
    async ({ id, name, description, charactersPerMonth, customVoices, usersCount }) => {
      // Format prices to match Stripe's API.
      // const pricesByInterval = Object.entries(prices).flatMap(([interval, price]) => {
      //   return Object.entries(price).map(([currency, amount]) => ({
      //     interval,
      //     currency,
      //     amount,
      //   }))
      // })

      // Create Stripe product.
      await stripe.products.create({
        id,
        name,
        description: description || undefined,
        metadata: { charactersPerMonth, customVoices, usersCount },
      })

      // Create Stripe price for the current product.
      // const newStripePrices = await Promise.all(
      //   pricesByInterval.map((price) => {
      //     return stripe.prices.create({
      //       product: id,
      //       currency: price.currency ?? 'brl',
      //       unit_amount: price.amount ?? 0,
      //       tax_behavior: 'inclusive',
      //       recurring: {
      //         interval: (price.interval as Interval) ?? 'month',
      //       },
      //     })
      //   }),
      // )

      const stripePrices = await stripe.prices.search({ query: `product:"${id}"` })

      // Store product into database.
      await prisma.plan.create({
        data: {
          id,
          name,
          description,
          usersCount,
          customVoices,
          charactersPerMonth,
          prices: {
            // create: newStripePrices.map((price) => ({
            create: stripePrices.data.map((price) => ({
              id: price.id,
              amount: price.unit_amount ?? 0,
              currency: price.currency,
              interval: price.recurring?.interval ?? 'month',
            })),
          },
        },
      })

      // Return product ID and prices.
      // Used to configure the Customer Portal.
      return {
        product: id,
        prices: stripePrices.data.map((price) => price.id),
        // prices: newStripePrices.map((price) => price.id),
      }
    },
  )

  // Create Stripe products and stores them into database.
  await Promise.all(seedProducts)
  console.info(`📦 Stripe Products has been successfully created.`)

  // Configure Customer Portal.
  // await stripe.billingPortal.configurations.create({
  //   business_profile: {
  //     headline: 'Speach Studio - Customer Portal',
  //   },
  //   features: {
  //     customer_update: {
  //       enabled: true,
  //       allowed_updates: ['address', 'shipping', 'tax_id', 'email'],
  //     },
  //     invoice_history: { enabled: true },
  //     payment_method_update: { enabled: true },
  //     subscription_cancel: { enabled: true },
  //     subscription_update: {
  //       enabled: true,
  //       default_allowed_updates: ['price'],
  //       proration_behavior: 'always_invoice',
  //       products: seededProducts.filter(({ product }) => product !== 'free'),
  //     },
  //   },
  // })

  console.info(`👒 Stripe Customer Portal has been successfully configured.`)
  console.info(
    '🎉 Visit: https://dashboard.stripe.com/test/products to see your products.',
  )
}

seed()
  .catch((err: unknown) => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await client.$disconnect()
  })
