import { getResend, getFromEmail } from './client';
import { renderOrderConfirmation, type OrderConfirmationData } from './templates';

export async function sendOrderConfirmation(to: string, data: OrderConfirmationData) {
  const { subject, html } = renderOrderConfirmation(data);
  return getResend().emails.send({
    from: `AMIS Meals <${getFromEmail()}>`,
    to,
    subject,
    html,
  });
}
