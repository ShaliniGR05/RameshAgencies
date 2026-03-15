import twilio from 'twilio';

const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

console.log('✅ Twilio WhatsApp client initialized — admin notifications are active');

/**
 * Sends a WhatsApp notification to the admin when a new order is placed.
 * @param {Object} order  - The saved Order document
 * @param {string} username - The customer's username
 */
export async function sendOrderNotification(order, username) {
    const itemsList = order.products
        .map(p => `  • ${p.name} x${p.quantity} @ ₹${p.price}`)
        .join('\n');

    const message =
        `🛒 *New Order Alert!*\n` +
        `━━━━━━━━━━━━━━━━\n` +
        `📦 *Order ID:* ${order._id}\n` +
        `👤 *Customer:* ${username}\n` +
        `📋 *Items:*\n${itemsList}\n` +
        `💰 *Total Amount:* ₹${order.totalAmount}\n` +
        `📌 *Status:* ${order.status}\n` +
        `⏰ *Time:* ${new Date(order.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`;

    await client.messages.create({
        from: process.env.TWILIO_WHATSAPP_FROM,
        to: process.env.ADMIN_WHATSAPP_TO,
        body: message,
    });

    console.log(`✅ WhatsApp notification sent to admin for Order ${order._id}`);
}
