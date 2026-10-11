// Backend do checkout Elite Gamer + AmploPay. Requer Node.js 20+.
// As chaves ficam em variáveis de ambiente, nunca no HTML público.
const express = require('express');
const crypto = require('crypto');
const path = require('path');
const app = express();
app.use(express.json({ limit: '32kb' }));
app.use(express.static(path.join(__dirname)));

const PORT = Number(process.env.PORT || 3000);
const PUBLIC_KEY = process.env.AMPLOPAY_PUBLIC_KEY;
const SECRET_KEY = process.env.AMPLOPAY_SECRET_KEY;
const CALLBACK_URL = process.env.AMPLOPAY_CALLBACK_URL || '';
const AMOUNT = 29.99;

app.post('/api/pix/create', async (req, res) => {
  try {
    if (!PUBLIC_KEY || !SECRET_KEY) {
      return res.status(503).json({ error: 'Checkout ainda não configurado: faltam as credenciais da AmploPay no servidor.' });
    }
    const { name, email, phone, document } = req.body || {};
    if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 120) {
      return res.status(400).json({ error: 'Informe seu nome completo.' });
    }
    if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
      return res.status(400).json({ error: 'Informe um e-mail válido.' });
    }
    if (typeof phone !== 'string' || phone.replace(/\D/g, '').length < 10 || phone.length > 30) {
      return res.status(400).json({ error: 'Informe um telefone válido.' });
    }
    const identifier = 'eg_' + crypto.randomUUID();
    const payload = {
      identifier,
      amount: AMOUNT,
      client: {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        ...(typeof document === 'string' && document.trim() ? { document: document.trim() } : {})
      },
      products: [{ id: 'elite-gamer-digital-2999', name: 'Produto digital Elite Gamer', quantity: 1, price: AMOUNT, physical: false }],
      metadata: { provider: 'Elite Gamer', orderId: identifier }
    };
    if (CALLBACK_URL) payload.callbackUrl = CALLBACK_URL;

    const apiResponse = await fetch('https://app.amplopay.com/api/v1/gateway/pix/receive', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-public-key': PUBLIC_KEY,
        'x-secret-key': SECRET_KEY
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(20000)
    });
    const result = await apiResponse.json().catch(() => ({}));
    if (!apiResponse.ok || !result.pix || !result.pix.code) {
      console.error('AmploPay create charge failed:', apiResponse.status, result.errorCode || result.message || result.errorDescription || 'Resposta sem código Pix');
      return res.status(502).json({ error: result.message || result.errorDescription || 'A AmploPay não conseguiu criar a cobrança. Tente novamente.' });
    }
    // Não retorna as chaves, nem considera o pagamento confirmado neste endpoint.
    return res.json({
      transactionId: result.transactionId,
      status: result.status,
      code: result.pix.code,
      image: result.pix.image || null,
      expiresAt: result.pix.expiresAt || null
    });
  } catch (error) {
    console.error('Pix creation error:', error.message);
    return res.status(500).json({ error: 'Erro temporário ao criar o Pix. Tente novamente.' });
  }
});

app.get('/health', (_req, res) => res.json({ ok: true }));
app.listen(PORT, () => console.log(`Elite Gamer checkout listening on port ${PORT}`));
