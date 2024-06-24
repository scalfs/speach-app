import { AudioPlayer } from '#app/components/audio-player.js'
import { Header } from '#app/components/header'
import { Navigation } from '#app/components/navigation'
import { subscriptionRepository } from '#app/infra/repository'
import { requireUser } from '#app/modules/auth/auth.server'
import { ROUTE_PATH as ONBOARDING_USERNAME_PATH } from '#app/routes/onboarding+/username'
import type { LoaderFunctionArgs } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
import { Outlet, useLoaderData } from '@remix-run/react'

export const ROUTE_PATH = '/dashboard' as const

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request)
  if (!user.username) return redirect(ONBOARDING_USERNAME_PATH)
  const subscription = await subscriptionRepository.getActiveSubscription(user.id)

  return json({ user, subscription } as const)
}

export default function Dashboard() {
  const { user, subscription } = useLoaderData<typeof loader>()

  return (
    <div className="flex min-h-[100vh] w-full flex-col bg-secondary dark:bg-black">
      <Navigation user={user} planId={subscription?.planId} />
      <Header />
      <Outlet />
      <AudioPlayer />
    </div>
  )
}
