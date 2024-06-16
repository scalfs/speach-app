import type { Price } from '@prisma/client'

/**
 * Enumerates subscription plan names.
 * These are used as unique identifiers in both the database and Stripe dashboard.
 */
export const PLANS = {
  FREE: 'free',
  STARTER: 'starter',
  ROCKET: 'rocket',
} as const

export type Plan = (typeof PLANS)[keyof typeof PLANS]

/**
 * Enumerates billing intervals for subscription plans.
 */
export const INTERVALS = {
  MONTH: 'month',
  YEAR: 'year',
} as const

export type Interval = (typeof INTERVALS)[keyof typeof INTERVALS]

/**
 * Enumerates supported currencies for billing.
 */
export const CURRENCIES = {
  DEFAULT: 'usd',
  USD: 'usd',
  EUR: 'eur',
  BRL: 'brl',
} as const

export type Currency = (typeof CURRENCIES)[keyof typeof CURRENCIES]

/**
 * Defines the structure for each subscription plan.
 *
 * Note:
 * - Running the Prisma seed will create these plans in your Stripe Dashboard and populate the database.
 * - Each plan includes pricing details for each interval and currency.
 * - Plan IDs correspond to the Stripe plan IDs for easy identification.
 * - 'name' and 'description' fields are used in Stripe Checkout and client UI.
 */

export const FREE_QUOTA = 2000

export const PRICING_PLANS = {
  [PLANS.FREE]: {
    id: PLANS.FREE,
    name: 'Gratuito',
    // description: 'Start with the basics, upgrade anytime.',
    description:
      'O básico para conhecer nosso sistema. Faça o upgrade a qualquer momento.',
    usersCount: 1,
    customVoices: 0,
    charactersPerMonth: FREE_QUOTA,
    prices: {
      [INTERVALS.MONTH]: {
        [CURRENCIES.USD]: 0,
        [CURRENCIES.EUR]: 0,
        [CURRENCIES.BRL]: 0,
      },
      [INTERVALS.YEAR]: {
        [CURRENCIES.USD]: 0,
        [CURRENCIES.EUR]: 0,
        [CURRENCIES.BRL]: 0,
      },
    },
  },
  [PLANS.STARTER]: {
    id: PLANS.STARTER,
    name: 'Starter',
    // description: 'Access to all features and unlimited projects.',
    description:
      'Acesso a todas funcionalidades com créditos suficientes para iniciar pequenos projetos.',
    usersCount: 1,
    customVoices: 5,
    charactersPerMonth: 50000,
    prices: {
      [INTERVALS.MONTH]: {
        [CURRENCIES.USD]: 15000,
        [CURRENCIES.EUR]: 15000,
        [CURRENCIES.BRL]: 15000,
      },
      [INTERVALS.YEAR]: {
        [CURRENCIES.USD]: 150000,
        [CURRENCIES.EUR]: 150000,
        [CURRENCIES.BRL]: 150000,
      },
    },
  },
  [PLANS.ROCKET]: {
    id: PLANS.ROCKET,
    name: 'Rocket',
    // description: 'Access to all features and unlimited projects.',
    description:
      'Para você que já está decolando. Contém tudo do Starter com mais vozes, usuários e maior tempo de gravação.',
    usersCount: 10,
    customVoices: 10,
    charactersPerMonth: 200000,
    prices: {
      [INTERVALS.MONTH]: {
        [CURRENCIES.USD]: 25000,
        [CURRENCIES.EUR]: 25000,
        [CURRENCIES.BRL]: 25000,
      },
      [INTERVALS.YEAR]: {
        [CURRENCIES.USD]: 250000,
        [CURRENCIES.EUR]: 250000,
        [CURRENCIES.BRL]: 250000,
      },
    },
  },
} satisfies PricingPlan

/**
 * A type helper defining prices for each billing interval and currency.
 */
type PriceInterval<I extends Interval = Interval, C extends Currency = Currency> = {
  [interval in I]: {
    [currency in C]: Price['amount']
  }
}

/**
 * A type helper defining the structure for subscription pricing plans.
 */
type PricingPlan<T extends Plan = Plan> = {
  [key in T]: {
    id: string
    name: string
    description: string
    usersCount: number
    customVoices: number
    charactersPerMonth: number
    prices: PriceInterval
  }
}
