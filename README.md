# Elite Gamer + AmploPay

## O que está implementado
- Front-end responsivo do checkout Elite Gamer.
- Endpoint de servidor `POST /api/pix/create` que valida os dados, fixa o valor em R$ 29,99, cria um identificador único por tentativa e chama a API AmploPay.
- Exibição do Pix Copia e Cola, imagem QR Code (quando fornecida) e expiração (`expiresAt`, quando fornecida).
- Chaves da API lidas exclusivamente de variáveis de ambiente no servidor.

## Executar localmente
1. Instale Node.js 20 ou superior.
2. No terminal, nesta pasta, execute `npm install`.
3. Configure `AMPLOPAY_PUBLIC_KEY` e `AMPLOPAY_SECRET_KEY` no ambiente do servidor (não publique essas chaves e não as coloque no HTML).
4. Execute `npm start` e abra `http://localhost:3000`.

## Antes de publicar
- Configure HTTPS e as variáveis de ambiente no host Node.js.
- A URL de callback/webhook exige implementar o endpoint segundo a documentação específica de webhooks da AmploPay, validando `webhookToken`/assinatura e consultando o estado da transação. Não configure `AMPLOPAY_CALLBACK_URL` para uma URL que não esteja implementada.
- Este pacote cria cobranças e mostra os dados Pix, mas **não implementa confirmação automática de pagamento nem liberação de produto**. Não libere conteúdo pago com base apenas no retorno da criação da cobrança; aguarde confirmação autenticada do provedor.
- O prazo real é o devolvido pela AmploPay. Este código não tenta forçar validade ilimitada.
- Faça uma cobrança de teste de baixo valor e confirme no painel AmploPay antes de vender.
