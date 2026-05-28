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
    
    // TODO: Add your logic here (e.g., update database, trigger SSE/WebSocket, etc.)
    // Ensure you use parameterized queries if saving to a database and escape outputs when rendering.

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
