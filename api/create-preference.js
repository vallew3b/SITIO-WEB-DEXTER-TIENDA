export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    try {
        const { items, payer, back_urls, statement_descriptor, accessToken } = req.body;

        const MP_ACCESS_TOKEN = accessToken || process.env.MP_ACCESS_TOKEN || "APP_USR-4491252823742678-061123-9a318cdf728f1e9310d6563a85ac06b9-1353270983";

        const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                items,
                payer,
                back_urls,
                auto_return: 'approved',
                statement_descriptor: statement_descriptor || 'IMPERIAL DESIGN'
            })
        });

        const data = await mpResponse.json();
        return res.status(200).json(data);
    } catch (error) {
        console.error('Error al crear preferencia de Mercado Pago:', error);
        return res.status(500).json({ error: error.message || 'Error al conectar con Mercado Pago' });
    }
}
