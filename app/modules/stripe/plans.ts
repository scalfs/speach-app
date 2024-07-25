import type { Price } from '@prisma/client'

/**
 * Enumerates subscription plan names.
 * These are used as unique identifiers in both the database and Stripe dashboard.
 */
export const PLANS = {
  FREE: 'free',
  EASY: 'easy',
  STARTER: 'starter',
  ROCKET: 'rocket',
  // INFINITY: 'infinity',
} as const

export type Plan = (typeof PLANS)[keyof typeof PLANS]

/**
 * Enumerates billing intervals for subscription plans.
 */
export const INTERVALS = {
  MONTH: 'month',
  YEAR: 'year',
  ONETIME: 'oneTime',
} as const

export type Interval = (typeof INTERVALS)[keyof typeof INTERVALS]

/**
 * Enumerates supported currencies for billing.
 */
export const CURRENCIES = {
  DEFAULT: 'brl',
  USD: 'usd',
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

export const FREE_CHARS_QUOTA = 500
export const FREE_USERS_QUOTA = 1
export const FREE_CUSTOM_VOICES_QUOTA = 0

export const PRICING_PLANS = {
  [PLANS.FREE]: {
    id: PLANS.FREE,
    name: 'Gratuito',
    // description: 'Start with the basics, upgrade anytime.',
    description:
      'O básico para conhecer nosso sistema. Faça o upgrade a qualquer momento.',
    usersCount: FREE_USERS_QUOTA,
    customVoices: FREE_CUSTOM_VOICES_QUOTA,
    charactersPerMonth: FREE_CHARS_QUOTA,
    prices: {
      [INTERVALS.MONTH]: { [CURRENCIES.USD]: 0, [CURRENCIES.BRL]: 0 },
      [INTERVALS.YEAR]: { [CURRENCIES.USD]: 0, [CURRENCIES.BRL]: 0 },
    },
  },
  [PLANS.EASY]: {
    id: PLANS.EASY,
    name: 'Easy',
    description:
      'Quer subir de nível? Nosso plano Easy inclui: 25.000 caracteres mensais | 30 minutos de gravação | Acesso a vozes profissionais | Suporte WhatsApp',
    usersCount: 1,
    customVoices: 2,
    charactersPerMonth: 25000,
    prices: {
      [INTERVALS.MONTH]: { [CURRENCIES.USD]: 2000, [CURRENCIES.BRL]: 9000 },
      [INTERVALS.YEAR]: { [CURRENCIES.USD]: 20000, [CURRENCIES.BRL]: 90000 },
    },
  },
  [PLANS.STARTER]: {
    id: PLANS.STARTER,
    name: 'Starter',
    description:
      'Vamos acelerar seus projetos! Nosso plano Starter inclui: 50.000 caracteres mensais | 60 minutos de gravação | Acesso a vozes profissionais | Suporte WhatsApp',
    usersCount: 1,
    customVoices: 5,
    charactersPerMonth: 50000,
    prices: {
      [INTERVALS.MONTH]: { [CURRENCIES.USD]: 5000, [CURRENCIES.BRL]: 15000 },
      [INTERVALS.YEAR]: { [CURRENCIES.USD]: 50000, [CURRENCIES.BRL]: 150000 },
    },
  },
  [PLANS.ROCKET]: {
    id: PLANS.ROCKET,
    name: 'Rocket',
    description:
      'Para você que já está decolando! Nosso plano Rocket inclui: 100.000 caracteres mensais | 120 minutos de gravação | Acesso a vozes profissionais | Suporte WhatsApp',
    usersCount: 10,
    customVoices: 10,
    charactersPerMonth: 100000,
    prices: {
      [INTERVALS.MONTH]: { [CURRENCIES.USD]: 7500, [CURRENCIES.BRL]: 25000 },
      [INTERVALS.YEAR]: { [CURRENCIES.USD]: 75000, [CURRENCIES.BRL]: 250000 },
    },
  },
  // [PLANS.INFINITY]: {
  //   id: PLANS.INFINITY,
  //   name: 'Infinity',
  //   description:
  //     'Amou o Speach? O plano Infinity tem o melhor valor. Tenha acesso vitalício às features atuais + tudo oferecido no Rocket, sem se preocupar com as mensalidades.',
  //   usersCount: 10,
  //   customVoices: 10,
  //   charactersPerMonth: 100000,
  //   prices: {
  //     [INTERVALS.ONETIME]: { [CURRENCIES.USD]: 40000, [CURRENCIES.BRL]: 200000 },
  //   },
  // },
} satisfies PricingPlan

/**
 * A type helper defining prices for each billing interval and currency.
 */
export type PriceInterval<
  I extends Interval = Interval,
  C extends Currency = Currency,
> = {
  [interval in I]?: {
    [currency in C]: Price['amount']
  }
}

/**
 * A type helper defining the structure for subscription pricing plans.
 */
export type PricingPlan<T extends Plan = Plan> = {
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
