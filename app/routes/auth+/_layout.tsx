import LogoColor from '#app/assets/logo-color.png'
import LogoWhite from '#app/assets/logo-white.png'

import { authenticator } from '#app/modules/auth/auth.server'
import { ROUTE_PATH as HOME_PATH } from '#app/routes/_home+/_layout'
import { ROUTE_PATH as LOGIN_PATH } from '#app/routes/auth+/login'
import { ROUTE_PATH as DASHBOARD_PATH } from '#app/routes/dashboard+/_layout'
import { useTheme } from '#app/utils/hooks/use-theme.js'
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

export default function Layout() {
  const theme = useTheme()

  return (
    <div className="w-fullw b flex h-screen bg-black">
      <div className="absolute left-1/2 top-10 mx-auto flex -translate-x-1/2 transform lg:hidden">
        <Link
          to={HOME_PATH}
          prefetch="intent"
          className="z-10">
          <img src={theme === 'dark' ? LogoWhite: LogoColor } alt="logo" className="h-24 w-auto" />
        </Link>
      </div>

      <div className="relative hidden h-full w-[50%] flex-col items-center justify-center overflow-hidden bg-[url('/app/assets/bg-login.png')] bg-cover p-10 lg:flex">
        <Link
          to={HOME_PATH}
          prefetch="intent"
          className="z-10 flex h-32 w-auto items-center gap-1">
          <img src={LogoWhite} alt="logo" className="h-32 w-auto" />
        </Link>

        <h2 className="text-white text-4xl font-thin max-w-[12rem] pt-24 pb-56">
          Você agora <br />
          faz parte <br />
          do futuro da <br />
          comunicação
        </h2>
      </div>

      <div className="flex h-full w-full flex-col border-l border-primary/5 bg-card lg:w-[50%]">
        <Outlet />
      </div>
    </div>
  )
}
