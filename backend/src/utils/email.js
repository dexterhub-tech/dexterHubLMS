/**
 * Email utility to send emails via Resend API
 */

const sendEmail = async ({ to, subject, html }) => {
    const apiKey = process.env.RESEND_API_KEY;
    const fromAddress = process.env.EMAIL_FROM || 'DexterHub <onboarding@resend.dev>';

    if (!apiKey) {
        console.log('\n==================================================');
        console.log('⚠️  RESEND_API_KEY IS NOT SET. SIMULATING EMAIL SEND.');
        console.log(`To:      ${to}`);
        console.log(`From:    ${fromAddress}`);
        console.log(`Subject: ${subject}`);
        console.log('--------------------------------------------------');
        console.log('HTML Body preview:');
        console.log(html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 200) + '...');
        console.log('==================================================\n');
        return { success: true, simulated: true };
    }

    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: fromAddress,
                to: Array.isArray(to) ? to : [to],
                subject,
                html,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Resend API response error ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        console.log(`✉️ Email successfully sent to ${to} via Resend. ID: ${data.id}`);
        return { success: true, data };
    } catch (error) {
        console.error('❌ Failed to send email via Resend:', error.message);
        return { success: false, error: error.message };
    }
};

module.exports = { sendEmail };
