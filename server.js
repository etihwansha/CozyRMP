const express = require('express');
const app = express();
app.use(express.json());

app.get('/', (req, res) => {
    res.send(`
        <h1>✅ Ely.by Auth Endpoint работает!</h1>
        <p>Endpoint для Gml.Backend: <strong>${req.protocol}://${req.get('host')}/auth/ely</strong></p>
        <p>Скопируйте этот URL в настройки Gml.Backend</p>
    `);
});

app.post('/auth/ely', async (req, res) => {
    try {
        const { Login, Password } = req.body;
        
        // Запрос к Ely.by
        const response = await fetch('https://authserver.ely.by/auth/authenticate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: Login,
                password: Password,
                clientToken: 'gml-auth-' + Date.now(),
                requestUser: false
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            res.json({
                success: true,
                user: {
                    uuid: data.selectedProfile.id,
                    username: data.selectedProfile.name,
                    accessToken: data.accessToken
                }
            });
        } else {
            res.status(401).json({
                success: false,
                error: data.errorMessage || 'Ошибка авторизации'
            });
        }
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Серверная ошибка'
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Сервер запущен на ${PORT}`));
