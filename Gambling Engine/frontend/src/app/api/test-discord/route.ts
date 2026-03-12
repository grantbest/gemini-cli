import { NextResponse } from 'next/server';

export async function POST() {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl || webhookUrl.includes('dummy')) {
    return NextResponse.json({ error: 'No valid Discord webhook URL configured.' }, { status: 400 });
  }

  const embed = {
    title: "🧪 Test Alert",
    description: "This is a test alert from the MLB Betting Engine management dashboard.",
    color: 3447003,
    fields: [
      { name: "Status", value: "Functional", inline: true },
      { name: "Environment", value: "Production/Live", inline: true }
    ],
    footer: { text: "MLB Betting Engine" }
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds: [embed] }),
    });

    if (!response.ok) throw new Error('Failed to send');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to send test alert' }, { status: 500 });
  }
}
