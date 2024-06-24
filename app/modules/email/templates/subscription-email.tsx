import { render } from '@react-email/render'
import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Img,
  Preview,
  Text,
} from '@react-email/components'
import { sendEmail } from '#app/modules/email/email.server'

type SubscriptionEmailOptions = {
  email: string
  subscriptionId: string
}

/**
 * Templates.
 */
export function SubscriptionSuccessEmail({ email }: SubscriptionEmailOptions) {
  return (
    <Html>
      <Head />
      {/* <Preview>Successfully Subscribed to PRO</Preview> */}
      <Preview>Assinatura PRO realizada com sucesso</Preview>
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
          <Text style={{ fontSize: '16px', lineHeight: '26px' }}>Olá {email}!</Text>
          <Text style={{ fontSize: '16px', lineHeight: '26px' }}>
            {/* Your subscription to PRO has been successfully processed. */}
            Sua assinatura foi realizada com sucesso.
            <br />
            {/* We hope you enjoy the new features! */}
            Esperamos que aproveite as novas ferramentas!
          </Text>
          <Text style={{ fontSize: '16px', lineHeight: '26px' }}>
            Do time <Link href="http://speach.studio">speach.studio</Link>.
          </Text>
          <Hr style={{ borderColor: '#cccccc', margin: '20px 0' }} />
          <Text style={{ color: '#8898aa', fontSize: '12px' }}>speach.studio</Text>
        </Container>
      </Body>
    </Html>
  )
}

export function SubscriptionErrorEmail({ email }: SubscriptionEmailOptions) {
  return (
    <Html>
      <Head />
      {/* <Preview>Subscription Issue - Customer Support</Preview> */}
      <Preview>Problema na Assinatura</Preview>
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
          <Text style={{ fontSize: '16px', lineHeight: '26px' }}>Olá {email}.</Text>
          <Text style={{ fontSize: '16px', lineHeight: '26px' }}>
            Infelizmente não conseguimos processar sua assinatura.
            {/* We were unable to process your subscription to PRO tier. */}
            <br />
            {/* But don't worry, we'll not charge you anything. */}
            Não se preocupe, nada será cobrado.
          </Text>
          <Text style={{ fontSize: '16px', lineHeight: '26px' }}>
            Do time <Link href="http://speach.studio">speach.studio</Link>.
          </Text>
          <Hr style={{ borderColor: '#cccccc', margin: '20px 0' }} />
          <Text style={{ color: '#8898aa', fontSize: '12px' }}>speach.studio</Text>
        </Container>
      </Body>
    </Html>
  )
}

/**
 * Renders.
 */
export function renderSubscriptionSuccessEmail(args: SubscriptionEmailOptions) {
  return render(<SubscriptionSuccessEmail {...args} />)
}

export function renderSubscriptionErrorEmail(args: SubscriptionEmailOptions) {
  return render(<SubscriptionErrorEmail {...args} />)
}

/**
 * Senders.
 */
export async function sendSubscriptionSuccessEmail({
  email,
  subscriptionId,
}: SubscriptionEmailOptions) {
  const html = renderSubscriptionSuccessEmail({ email, subscriptionId })

  await sendEmail({
    to: email,
    subject: 'Assinatura realizada com sucesso',
    html,
  })
}

export async function sendSubscriptionErrorEmail({
  email,
  subscriptionId,
}: SubscriptionEmailOptions) {
  const html = renderSubscriptionErrorEmail({ email, subscriptionId })

  await sendEmail({
    to: email,
    subject: 'Problema na Assinatura - Suporte ao Cliente',
    html,
  })
}
