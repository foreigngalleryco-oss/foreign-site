const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const SMS_FROM = process.env.SMS_FROM;

export async function sendSmsVerificationCode(phone: string, code: string): Promise<void> {
  const message = `Your FOREIGN verification code is ${code}. It expires in 10 minutes.`;

  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !SMS_FROM) {
    console.log(`[mock-sms] ${phone} -> ${message}`);
    return;
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
  const credentials = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64");

  const body = new URLSearchParams({
    To: phone,
    From: SMS_FROM,
    Body: message
  });

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Twilio SMS failed: ${response.status} ${details}`);
  }
}
