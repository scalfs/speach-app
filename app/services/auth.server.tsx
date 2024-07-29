import { Authenticator } from 'remix-auth'
import { sessionStorage } from './session.server'
import { GoogleStrategy, SocialsProvider } from 'remix-auth-socials'

export const google_authenticator = new Authenticator(sessionStorage)

async function handleSocialCallback({profile}) {
    console.log(profile)
    return profile;
}

google_authenticator.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    scope: ["openid email profile"],
    callbackURL: `http://localhost:3000/auth/${SocialsProvider.GOOGLE}/callback`
},
    handleSocialCallback
))