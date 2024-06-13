import IconColor from '#app/assets/icon-color.png'
import { authenticator } from '#app/modules/auth/auth.server'
import { ROUTE_PATH as HOME_PATH } from '#app/routes/_home+/_layout'
import { ROUTE_PATH as LOGIN_PATH } from '#app/routes/auth+/login'
import { ROUTE_PATH as DASHBOARD_PATH } from '#app/routes/dashboard+/_layout'
import { getDomainPathname } from '#app/utils/misc.server'
import type { LoaderFunctionArgs } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
import { Link, Outlet } from '@remix-run/react'

export const ROUTE_PATH = '/auth' as const

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticator.isAuthenticated(request, {
    successRedirect: DASHBOARD_PATH,
  })
  const pathname = getDomainPathname(request)
  if (pathname === ROUTE_PATH) return redirect(LOGIN_PATH)
  return json({})
}

const QUOTES = [
  {
    quote: 'Não há nada impossível àqueles que tentam.',
    author: 'Alexandre, o Grande',
  },
  {
    quote: 'A única maneira de fazer um ótimo trabalho é amar o que você faz.',
    author: 'Steve Jobs',
  },
  {
    quote: 'A melhor maneira de prever o futuro é criá-lo.',
    author: 'Peter Drucker',
  },
  {
    quote:
      'O único limite para a nossa concretização do amanhã serão as nossas dúvidas de hoje.',
    author: 'Franklin D. Roosevelt',
  },
  {
    quote: 'A única coisa que devemos temer é o próprio medo.',
    author: 'Franklin D. Roosevelt',
  },
]

export default function Layout() {
  const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)]

  return (
    <div className="w-fullw b flex h-screen bg-black">
      <div className="absolute left-1/2 top-10 mx-auto flex -translate-x-1/2 transform lg:hidden">
        <Link
          to={HOME_PATH}
          prefetch="intent"
          className="z-10 flex h-10 flex-col items-center justify-center gap-2">
          <img src={IconColor} alt="logo" className="h-10 w-auto" />
        </Link>
      </div>
      <div className="relative hidden h-full w-[50%] flex-col justify-between overflow-hidden bg-card p-10 lg:flex">
        <Link
          to={HOME_PATH}
          prefetch="intent"
          className="z-10 flex h-10 w-10 items-center gap-1">
          <img src={IconColor} alt="logo" className="h-10 w-auto" />
        </Link>

        <div className="z-10 flex flex-col items-start gap-2">
          <p className="text-base font-normal text-foreground">{randomQuote.quote}</p>
          <p className="text-base font-normal text-foreground/60">
            - {randomQuote.author}
          </p>
        </div>
        <div className="base-grid absolute left-0 top-0 z-0 h-full w-full opacity-40" />
      </div>
      <div className="flex h-full w-full flex-col border-l border-primary/5 bg-card lg:w-[50%]">
        <Outlet />
      </div>
    </div>
  )
}
