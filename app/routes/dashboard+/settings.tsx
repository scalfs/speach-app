import type { MetaFunction, LoaderFunctionArgs } from '@remix-run/node'
import { Link, Outlet, useLocation } from '@remix-run/react'
import { json } from '@remix-run/node'
import { z } from 'zod'
import { requireUser } from '#app/modules/auth/auth.server'
import { cn } from '#app/utils/misc'
import { ROUTE_PATH as BILLING_PATH } from '#app/routes/dashboard+/settings.billing'
import { buttonVariants } from '#app/components/ui/button'

export const ROUTE_PATH = '/dashboard/settings' as const

export const UsernameSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(20)
    .toLowerCase()
    .trim()
    .regex(/^[a-zA-Z0-9]+$/, 'Username deve possuir apenas caracteres alfanuméricos.'),
})

export const meta: MetaFunction = () => {
  return [{ title: 'Configurações' }]
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request)
  return json({ user })
}

export default function DashboardSettings() {
  const location = useLocation()
  const isSettingsPath = location.pathname === ROUTE_PATH
  const isBillingPath = location.pathname === BILLING_PATH

  return (
    <div className="flex h-full w-full px-6 py-8">
      <div className="mx-auto flex h-full w-full max-w-screen-xl gap-12">
        <div className="hidden w-full max-w-64 flex-col gap-0.5 lg:flex">
          <Link
            to={ROUTE_PATH}
            prefetch="intent"
            className={cn(
              `${buttonVariants({ variant: 'ghost' })} ${isSettingsPath && 'bg-primary/5'} justify-start rounded-md`,
            )}>
            <span
              className={cn(
                `text-sm text-foreground/80 ${isSettingsPath && 'font-medium text-foreground'}`,
              )}>
              Geral
            </span>
          </Link>
          <Link
            to={BILLING_PATH}
            prefetch="intent"
            className={cn(
              `${buttonVariants({ variant: 'ghost' })} ${isBillingPath && 'bg-primary/5'} justify-start rounded-md`,
            )}>
            <span
              className={cn(
                `text-sm text-foreground/80 ${isBillingPath && 'font-medium text-foreground'}`,
              )}>
              Assinatura
            </span>
          </Link>
        </div>

        <Outlet />
      </div>
    </div>
  )
}
