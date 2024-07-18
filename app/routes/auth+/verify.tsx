import type {
  MetaFunction,
  LoaderFunctionArgs,
  ActionFunctionArgs,
} from '@remix-run/node'
import { useRef, useEffect } from 'react'
import { Form, useLoaderData } from '@remix-run/react'
import { json, redirect } from '@remix-run/node'
import { useHydrated } from 'remix-utils/use-hydrated'
import { AuthenticityTokenInput } from 'remix-utils/csrf/react'
import { HoneypotInputs } from 'remix-utils/honeypot/react'
import { z } from 'zod'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { authenticator } from '#app/modules/auth/auth.server'
import { getSession, commitSession } from '#app/modules/auth/auth-session.server'
import { validateCSRF } from '#app/utils/csrf.server'
import { checkHoneypot } from '#app/utils/honeypot.server'
import { siteConfig } from '#app/utils/constants/brand'
import { ROUTE_PATH as DASHBOARD_PATH } from '#app/routes/dashboard+/_layout'
import { Input } from '#app/components/ui/input'
import { Button } from '#app/components/ui/button'

export const ROUTE_PATH = '/auth/verify' as const

export const VerifyLoginSchema = z.object({
  code: z.string().min(6, 'O código possui pelo menos 6 caracteres.'),
})

export const meta: MetaFunction = () => {
  return [{ title: `${siteConfig.siteTitle} - Verificação` }]
}

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticator.isAuthenticated(request, {
    successRedirect: DASHBOARD_PATH,
  })

  const cookie = await getSession(request.headers.get('Cookie'))
  const authEmail = cookie.get('auth:email')
  const authError = cookie.get(authenticator.sessionErrorKey)

  if (!authEmail) return redirect('/auth/login')

  return json({ authEmail, authError } as const, {
    headers: {
      'Set-Cookie': await commitSession(cookie),
    },
  })
}

export async function action({ request }: ActionFunctionArgs) {
  const url = new URL(request.url)
  const pathname = url.pathname

  const clonedRequest = request.clone()
  const formData = await clonedRequest.formData()
  await validateCSRF(formData, clonedRequest.headers)
  checkHoneypot(formData)

  await authenticator.authenticate('TOTP', request, {
    successRedirect: pathname,
    failureRedirect: pathname,
  })
}

export default function Verify() {
  const { authEmail, authError } = useLoaderData<typeof loader>()
  const inputRef = useRef<HTMLInputElement>(null)
  const isHydrated = useHydrated()

  const [codeForm, { code }] = useForm({
    constraint: getZodConstraint(VerifyLoginSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: VerifyLoginSchema })
    },
  })

  useEffect(() => {
    isHydrated && inputRef.current?.focus()
  }, [isHydrated])

  return (
    <div className="mx-auto flex h-full w-full flex-col items-center justify-center gap-6 max-w-96">
      <div className="mb-2 flex flex-col gap-2">
        <p className="text-center text-2xl text-foreground">Verifique seu inbox!</p>
        <p className="text-center text-base font-normal text-foreground/60">
          Nós acabamos de te enviar uma senha temporária.
          <br />
          Por favor, digite-a abaixo.
        </p>
      </div>

      <Form
        method="POST"
        autoComplete="off"
        className="flex w-full flex-col items-start gap-1"
        {...getFormProps(codeForm)}>
        <AuthenticityTokenInput />
        <HoneypotInputs />

        <div className="flex w-full flex-col gap-1.5">
          <label htmlFor="code" className="sr-only">
            Código
          </label>
          <Input
            placeholder="Código"
            ref={inputRef}
            required
            className={`bg-transparent ${
              code.errors && 'border-destructive focus-visible:ring-destructive'
            }`}
            {...getInputProps(code, { type: 'text' })}
          />
        </div>

        <div className="flex flex-col">
          {!authError && code.errors && (
            <span className="mb-2 text-sm text-destructive dark:text-destructive-foreground">
              {code.errors.join(' ')}
            </span>
          )}
          {authEmail && authError && (
            <span className="mb-2 text-sm text-destructive dark:text-destructive-foreground">
              {authError.message}
            </span>
          )}
        </div>

        <Button type="submit" className="w-full">
          Continuar
        </Button>
      </Form>

      {/* Request New Code. */}
      {/* Email is already in session, input it's not required. */}
      <Form method="POST" className="flex w-full flex-col">
        <AuthenticityTokenInput />
        <HoneypotInputs />

        <p className="text-center text-sm font-normal text-foreground/60">
          Não recebeu o código?
        </p>
        <Button type="submit" variant="ghost" className="w-full hover:bg-transparent">
          Reenviar código
        </Button>
      </Form>
    </div>
  )
}
