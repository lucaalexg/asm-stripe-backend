const Stripe = require("stripe");

module.exports = async (req, res) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ error: "Missing email" });

    const account = await stripe.accounts.create({
      type: "express",
      email,
    });

    const origin = process.env.PUBLIC_ORIGIN;

    const link = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: origin,
      return_url: origin,
      type: "account_onboarding",
    });

    return res.status(200).json({
      stripe_account_id: account.id,
      onboarding_url: link.url,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
