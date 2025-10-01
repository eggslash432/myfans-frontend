import { loadStripe } from '@stripe/stripe-js'


export const getStripe = () => {
const pk = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string
if (!pk) throw new Error('VITE_STRIPE_PUBLISHABLE_KEY is missing')
return loadStripe(pk)
}