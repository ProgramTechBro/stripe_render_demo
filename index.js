// index.js
require('dotenv').config();
const express = require('express');
const Stripe = require('stripe');
const cors = require('cors');

const app = express();
app.use(cors()); // allow all origins for testing (tighten in prod)
app.use(express.json());

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

app.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'usd' } = req.body;

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount. Amount must be number > 0 (in smallest unit).' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,          // smallest unit (e.g. cents)
      currency: currency,      // e.g. 'usd'
      automatic_payment_methods: { enabled: true },
    });

    return res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error('Create PaymentIntent error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// simple health check
app.get('/', (req, res) => res.send('Stripe Render demo running'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
