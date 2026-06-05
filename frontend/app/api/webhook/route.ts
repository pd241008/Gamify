import { Receiver } from "@upstash/qstash";
import { NextResponse } from "next/server";

export interface MatchNotificationPayload {
  match_id: string;
  match_name: string;
  tournament_id: string;
  status: string;
  scheduled_at: string;
  team_a?: string;
  team_b?: string;
  videogame: string;
}

export async function POST(request: Request) {
  try {
    const signature = request.headers.get("upstash-signature");
    if (!signature) {
      return new NextResponse("Missing signature", { status: 401 });
    }

    const bodyText = await request.text();

    const currentSigningKey = process.env.QSTASH_CURRENT_SIGNING_KEY;
    const nextSigningKey = process.env.QSTASH_NEXT_SIGNING_KEY;

    if (!currentSigningKey || !nextSigningKey) {
      console.error("QStash signing keys are not configured.");
      return new NextResponse("Internal Server Error", { status: 500 });
    }

    const receiver = new Receiver({
      currentSigningKey,
      nextSigningKey,
    });

    const isValid = await receiver.verify({
      signature,
      body: bodyText,
    });

    if (!isValid) {
      return new NextResponse("Invalid signature", { status: 401 });
    }

    const payload = JSON.parse(bodyText) as MatchNotificationPayload;

    // Validate essential fields to prevent injection or malformed data
    if (!payload.match_id || typeof payload.match_id !== "string") {
      return new NextResponse("Invalid payload format", { status: 400 });
    }

    console.log(`✅ Verified QStash webhook for match ID: ${payload.match_id}`);
    
    // Fetch all users from Clerk (In production, use a dedicated DB to avoid rate limits/pagination limits)
    const { clerkClient } = await import('@clerk/nextjs/server');
    const client = await clerkClient();
    
    // Default limit is usually 10-100, we'll fetch up to 100 for this demo
    const usersResponse = await client.users.getUserList({ limit: 100 });
    const users = usersResponse.data;

    let notifiedCount = 0;

    for (const user of users) {
      const metadata = user.publicMetadata as { games?: string[], discordWebhook?: string };
      
      if (!metadata.discordWebhook || !metadata.discordWebhook.startsWith('https://discord.com/api/webhooks/')) {
        continue;
      }

      // If the user hasn't selected games, they don't get notifications.
      // Or we can say if it's empty, send everything? Let's strictly require them to follow the game.
      // Wait, QStash payload doesn't have `videogame` by default! Let's check `MatchNotificationPayload`
      // Wait! `MatchNotificationPayload` does NOT have `videogame`!
      // I need to add `videogame` to the payload in `main.go`.
      // For now, if videogame is missing in the webhook payload, we might not be able to filter.
      // Let's assume `payload.videogame` exists.
      const matchGame = (payload as any).videogame || "";
      
      if (metadata.games && metadata.games.includes(matchGame)) {
        // Send to Discord!
        try {
          const discordRes = await fetch(metadata.discordWebhook, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              content: `🎮 **GAMIFY ALERT** 🎮`,
              embeds: [{
                title: `${payload.match_name || payload.team_a + " vs " + payload.team_b}`,
                description: `Match Status: **${payload.status}**`,
                color: 11141375, // Purple
                fields: [
                  { name: "Game", value: matchGame, inline: true },
                  { name: "Tournament ID", value: payload.tournament_id, inline: true },
                  { name: "Scheduled For", value: new Date(payload.scheduled_at).toLocaleString(), inline: false }
                ],
                footer: { text: "Gamify Esports Pipeline" }
              }]
            })
          });

          if (discordRes.ok) {
            notifiedCount++;
          } else {
            console.error(`Failed to send Discord notification to user ${user.id}: ${discordRes.statusText}`);
          }
        } catch (e) {
          console.error(`Error sending Discord notification to user ${user.id}:`, e);
        }
      }
    }

    console.log(`✅ Sent Discord notifications to ${notifiedCount} users for match ${payload.match_id}`);

    return NextResponse.json({ success: true, notifiedCount });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
