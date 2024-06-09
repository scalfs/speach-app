import { render } from '@react-email/render'
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Section,
  Img,
  Button,
  Preview,
  Text,
} from '@react-email/components'
import { sendEmail } from '#app/modules/email/email.server'

type AuthEmailOptions = {
  email: string
  code: string
  magicLink?: string | null
}

/**
 * Templates.
 */
export function AuthEmail({ code, magicLink }: AuthEmailOptions) {
  return (
    <Html>
      <Head />
      <Preview>Seu código de login para Speach Studio</Preview>
      <Body
        style={{
          backgroundColor: '#ffffff',
          fontFamily:
            '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
        }}>
        <Container style={{ margin: '0 auto', padding: '20px 0 48px' }}>
          <Img
            src="https://speach.studio/wp-content/uploads/2023/08/LOGO.png"
            width="170"
            height="60"
            alt=""
          />
          <Heading
            style={{
              fontSize: '24px',
              letterSpacing: '-0.5px',
              lineHeight: '1.2',
              fontWeight: '400',
              color: '#484848',
              padding: '12px 0 0',
            }}>
            Seu código de login para Speach Studio
          </Heading>
          {magicLink && (
            <Section style={{ padding: '8px 0px' }}>
              <Button
                pY={11}
                pX={23}
                style={{
                  display: 'block',
                  color: '#fff',
                  fontSize: '15px',
                  fontWeight: '600',
                  textDecoration: 'none',
                  textAlign: 'center',
                  borderRadius: '3px',
                  backgroundColor: '#f97316',
                }}
                href={magicLink}>
                {/* Login to totp.fly */}
                Continue para speach.studio
              </Button>
            </Section>
          )}
          <Text style={{ fontSize: '14px', lineHeight: '20px' }}>
            {/* This link and code will only be valid for the next 60 seconds. If the link
            does not work, you can use the login verification code directly: */}
            Este link e código serão válidos pelos próximos 5 minutos. Caso o link não
            funcione, você pode usar o código de login diretamente:
          </Text>
          <code
            style={{
              padding: '1px 4px',
              color: '#3c4149',
              fontFamily: 'sans-serif',
              fontSize: '24px',
              fontWeight: '700',
              letterSpacing: '2px',
            }}>
            {code}
          </code>
          <Hr style={{ margin: '20px 0', borderColor: '#cccccc' }} />
          <Text style={{ color: '#8898aa', fontSize: '12px' }}>speach.studio</Text>
        </Container>
      </Body>
    </Html>
  )
}

/**
 * Renders.
 */
export function renderAuthEmailEmail(args: AuthEmailOptions) {
  return render(<AuthEmail {...args} />)
}

/**
 * Senders.
 */
export async function sendAuthEmail({ email, code, magicLink }: AuthEmailOptions) {
  const html = renderAuthEmailEmail({ email, code, magicLink })

  await sendEmail({
    to: email,
    subject: 'Seu código de login para Speach Studio',
    html,
  })
}
