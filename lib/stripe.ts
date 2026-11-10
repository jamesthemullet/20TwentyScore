import Stripe from 'stripe';
import { requireEnv } from './env';
import { lazySingleton } from './lazySingleton';

let _stripe: Stripe | undefined;

function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(requireEnv('STRIPE_SECRET_KEY'), {
      apiVersion: '2026-10-28.endive',
    });
  }
  return _stripe;
}

export const stripe = lazySingleton(getStripe);
