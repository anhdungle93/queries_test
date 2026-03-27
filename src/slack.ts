const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

export interface StaleOrder {
  order_id: number;
  customer_name: string;
  phone: string;
  days_since_created: number;
}

export async function sendSlackMessage(
  channel: string,
  text: string,
  blocks?: object[],
): Promise<void> {
  if (!SLACK_WEBHOOK_URL) {
    throw new Error("SLACK_WEBHOOK_URL environment variable is not set");
  }

  const body: Record<string, unknown> = { channel, text };
  if (blocks) body.blocks = blocks;

  const response = await fetch(SLACK_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(
      `Slack request failed: ${response.status} ${response.statusText}`,
    );
  }
}

export async function alertStaleOrders(orders: StaleOrder[]): Promise<void> {
  if (orders.length === 0) return;

  const lines = orders
    .map(
      (o) =>
        `• *${o.customer_name}* — ${o.phone ?? "no phone"} (Order #${o.order_id}, ${Math.floor(o.days_since_created)}d pending)`,
    )
    .join("\n");

  await sendSlackMessage(
    "#order-alerts",
    `:warning: ${orders.length} order(s) have been pending for more than 3 days`,
    [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `:warning: *${orders.length} order(s) pending more than 3 days*\n\n${lines}`,
        },
      },
    ],
  );
}
