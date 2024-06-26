import type { LoaderFunctionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { requireUserWithRole } from '#app/utils/permissions.server'

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUserWithRole(request, 'admin')
  return json({ user } as const)
}

export default function AdminIndex() {
  return (
    <div className="flex w-full flex-col gap-2 p-6 py-2">
      <h2 className="text-xl font-medium text-foreground">Começar</h2>
      <p className="text-sm font-normal text-foreground/60">
        Explore o Painel Administrativo.
      </p>
    </div>
  )
}
