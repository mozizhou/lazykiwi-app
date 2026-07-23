/**
 * Stripe live-mode catalog IDs (acct_1TYOFsAnJyGrhJr1 / lazykiwi).
 * Backend resolves checkout via lazykiwi.billing.prices in application-my.yaml.
 */
export const STRIPE_PRICES = {
  starter: {
    monthly: 'price_1TrFjCAnJyGrhJr11x3gsjlQ',
    yearly: 'price_1TrFjDAnJyGrhJr1gxR4DI8J',
  },
  basic: {
    monthly: 'price_1TrFjFAnJyGrhJr1O1yX5j9t',
    yearly: 'price_1Tvq0kAnJyGrhJr1UfXsg7SP',
  },
  pro: {
    monthly: 'price_1TrFjLAnJyGrhJr1DiuDOFG6',
    yearly: 'price_1Tvq0nAnJyGrhJr1v2TI9m6z',
  },
  ultimate: {
    monthly: 'price_1TrFjOAnJyGrhJr1HRCgFnpO',
    yearly: 'price_1Tvq0sAnJyGrhJr1gloKZNdV',
  },
};

export const STRIPE_PRODUCTS = {
  starter: 'prod_Uqxesw139JfQh1',
  basic: 'prod_UqxeACwP5dUvUu',
  pro: 'prod_UqxeSnpP78SZ9Y',
  ultimate: 'prod_UqxePOiw64xHnz',
};

export const PLAN_MONTHLY_CREDITS = {
  starter: 500,
  basic: 1200,
  pro: 3500,
  ultimate: 7000,
};
