import { db } from "@/lib/db";
import { ConversationsClient } from "@/components/conversations/conversations-client";

export default async function ConversationsPage() {
  const conversations = await db.conversation.findMany({ orderBy: { date: "desc" } });

  return (
    <ConversationsClient
      initialConversations={conversations.map((c) => ({
        ...c,
        date: c.date.toISOString(),
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
      }))}
    />
  );
}
