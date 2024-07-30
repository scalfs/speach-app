import type {
  MetaFunction,
  LoaderFunctionArgs,
  ActionFunctionArgs,
} from '@remix-run/node'
import { useRef, useEffect } from 'react'
import { Form, useLoaderData } from '@remix-run/react'
import { json } from '@remix-run/node'
import { useHydrated } from 'remix-utils/use-hydrated'
import { AuthenticityTokenInput } from 'remix-utils/csrf/react'
import { HoneypotInputs } from 'remix-utils/honeypot/react'
import { z } from 'zod'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { Loader2 } from 'lucide-react'
import { authenticator } from '#app/modules/auth/auth.server'
import { getSession, commitSession } from '#app/modules/auth/auth-session.server'
import { validateCSRF } from '#app/utils/csrf.server'
import { checkHoneypot } from '#app/utils/honeypot.server'
import { useIsPending } from '#app/utils/misc'
import { siteConfig } from '#app/utils/constants/brand'
import { Input } from '#app/components/ui/input'
import { Button } from '#app/components/ui/button'
import { ROUTE_PATH as DASHBOARD_PATH } from '#app/routes/dashboard+/_layout'
import { ROUTE_PATH as AUTH_VERIFY_PATH } from '#app/routes/auth+/verify'
import { SocialsProvider } from 'remix-auth-socials'

export const ROUTE_PATH = '/auth/login' as const

export const LoginSchema = z.object({
  email: z.string().max(256).email('Email address is not valid.'),
})

export const meta: MetaFunction = () => {
  return [{ title: `${siteConfig.siteTitle} - Login` }]
}

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticator.isAuthenticated(request, {
    successRedirect: DASHBOARD_PATH,
  })

  const cookie = await getSession(request.headers.get('Cookie'))
  const authEmail = cookie.get('auth:email')
  const authError = cookie.get(authenticator.sessionErrorKey)

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
    successRedirect: AUTH_VERIFY_PATH,
    failureRedirect: pathname,
  })
}

export default function Login() {
  const { authEmail, authError } = useLoaderData<typeof loader>()
  const inputRef = useRef<HTMLInputElement>(null)
  const isHydrated = useHydrated()
  const isPending = useIsPending()

  const [emailForm, { email }] = useForm({
    constraint: getZodConstraint(LoginSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: LoginSchema })
    },
  })

  useEffect(() => {
    isHydrated && inputRef.current?.focus()
  }, [isHydrated])

  return (
    <div className="mx-auto flex h-full w-full max-w-96 flex-col items-center justify-center gap-6">
      <div className="mb-2 flex flex-col gap-2">
        <h3 className="text-center text-2xl font-medium text-foreground">
          Vamos começar
        </h3>
        <p className="text-center text-base font-normal text-foreground/60">
          Bem vindo! Por favor, faça o login para continuar.
        </p>
      </div>

      <Form
        method="POST"
        autoComplete="off"
        className="flex w-full flex-col items-center gap-1"
        {...getFormProps(emailForm)}>
        {/* Security */}
        <AuthenticityTokenInput />
        <HoneypotInputs />
        <div className="flex w-full flex-col gap-1.5">
          <label htmlFor="email" className="sr-only">
            Email
          </label>
          <Input
            placeholder="Email"
            ref={inputRef}
            defaultValue={authEmail ? authEmail : ''}
            className={`bg-transparent ${
              email.errors && 'border-destructive focus-visible:ring-destructive'
            }`}
            {...getInputProps(email, { type: 'email' })}
          />
        </div>

        <div className="flex flex-col">
          {!authError && email.errors && (
            <span className="mb-2 text-sm text-destructive dark:text-destructive-foreground">
              {email.errors.join(' ')}
            </span>
          )}
          {!authEmail && authError && (
            <span className="mb-2 text-sm text-destructive dark:text-destructive-foreground">
              {authError.message}
            </span>
          )}
        </div>

        <Button type="submit" className="w-full">
          {isPending ? <Loader2 className="animate-spin" /> : 'Continuar com Email'}
        </Button>
      </Form>

      <div className="relative flex w-full items-center justify-center">
        <span className="absolute w-full border-b border-border" />
        <span className="z-10 bg-card px-2 text-xs font-medium uppercase text-foreground/60">
          Ou continue com
        </span>
      </div>

      <Form
        method="post"
        action={`/auth/${SocialsProvider.GOOGLE}`}
        className="w-full"
      >
        <Button variant="outline" className='w-full gap-2 bg-transparent'>
        <svg xmlns="http://www.w3.org/2000/svg" 
          className='h-4 w-4 text-foreground/80 group-hover:text-foreground'
          preserveAspectRatio="xMidYMid" 
          viewBox="0 0 256 262" id="google"
        >
          <path fill="#4285F4" d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"></path><path fill="#34A853" d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"></path><path fill="#FBBC05" d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782"></path><path fill="#EB4335" d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"></path>
        </svg>
          Google
        </Button>
      </Form>

      {/*
      <Form action={`/auth/github`} method="POST" className="w-full">
        <Button variant="outline" className="w-full gap-2 bg-transparent">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 text-foreground/80 group-hover:text-foreground"
            viewBox="0 0 24 24">
            <path
              fill="currentColor"
              fillRule="nonzero"
              d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
            />
          </svg>
          Github
        </Button>
      </Form> */}

      <p className="px-6 text-center text-sm font-normal leading-normal text-foreground/60">
        Ao clicar em continuar, você concorda com nossos{' '}
        <a href="/" className="underline hover:text-primary">
          Termos de serviço
        </a>{' '}
        e{' '}
        <a href="/" className="underline hover:text-primary">
          Política de Privacidade.{' '}
        </a>
        <br />
        Todos os direitos reservados a Speach.
      </p>
      {/* <p className="px-12 text-center text-sm font-normal leading-normal text-primary/60">
        Todos os direitos reservador a Speach.
      </p> */}
    </div>
  )
}
