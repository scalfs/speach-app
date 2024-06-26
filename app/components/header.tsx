import { useLocation } from '@remix-run/react'
import { ROUTE_PATH as DASHBOARD_PATH } from '#app/routes/dashboard+/_layout'
import { ROUTE_PATH as BILLING_PATH } from '#app/routes/dashboard+/settings.billing'
import { ROUTE_PATH as SETTINGS_PATH } from '#app/routes/dashboard+/settings'
import { ROUTE_PATH as STS_PATH } from '#app/routes/dashboard+/sts'
import { ROUTE_PATH as ADMIN_PATH } from '#app/routes/admin+/_layout'

export function Header() {
  const location = useLocation()
  const allowedLocations = [
    DASHBOARD_PATH,
    STS_PATH,
    BILLING_PATH,
    SETTINGS_PATH,
    ADMIN_PATH,
  ]

  const headerTitle = () => {
    if (location.pathname === DASHBOARD_PATH) return 'Text to Speach'
    if (location.pathname === STS_PATH) return 'Speach to Speach'
    if (location.pathname === BILLING_PATH) return 'Assinatura'
    if (location.pathname === SETTINGS_PATH) return 'Configurações'
    if (location.pathname === ADMIN_PATH) return 'Admin'
  }
  const headerDescription = () => {
    if (location.pathname === DASHBOARD_PATH)
      return 'Transforme seu texto em um áudio de alta qualidade.'
    if (location.pathname === STS_PATH)
      return 'Converta seu áudio, deixando-o pronto para produção.'
    if (location.pathname === SETTINGS_PATH)
      return 'Gerencie as configurações de sua conta.'
    if (location.pathname === BILLING_PATH) return 'Gerencie sua assinatura e seu plano.'
    if (location.pathname === ADMIN_PATH) return 'Seu dashboard administrativo.'
  }

  if (!allowedLocations.includes(location.pathname as (typeof allowedLocations)[number]))
    return null

  return (
    <header className="z-10 flex w-full flex-col border-b border-border bg-card px-6">
      <div className="mx-auto flex w-full max-w-screen-xl items-center justify-between py-6 md:py-12">
        <div className="flex flex-col items-start gap-2">
          <h1 className="text-3xl font-medium text-foreground/80">{headerTitle()}</h1>
          <p className="text-base font-normal text-foreground/60">
            {headerDescription()}
          </p>
        </div>
      </div>
    </header>
  )
}
