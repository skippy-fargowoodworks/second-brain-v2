import { db } from "@/lib/db";
import { VaultClient } from "@/components/vault/vault-client";

export default async function VaultPage() {
  const credentials = await db.credential.findMany({ orderBy: { updatedAt: "desc" } });

  return (
    <VaultClient
      initialCredentials={credentials.map((c) => ({
        ...c,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
      }))}
    />
  );
}
