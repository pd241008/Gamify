'use server';

import { auth, clerkClient } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';

export async function updateUserPreferences(games: string[], discordWebhook: string) {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error('Not authenticated');
  }

  const client = await clerkClient();
  
  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      games,
      discordWebhook
    }
  });

  revalidatePath('/matches');
  revalidatePath('/settings');
}
