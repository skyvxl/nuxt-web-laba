import { Client, Account, Databases, Storage, Users, ID } from "node-appwrite";

// Memoized client instance (one per server process)
let memoizedClient: Client | null = null;

export function createAppwriteClient() {
  // Return memoized client if available
  if (import.meta.server && memoizedClient) {
    return memoizedClient;
  }

  const config = useRuntimeConfig();
  const client = new Client();
  client
    .setEndpoint(config.public.appwriteEndpoint)
    .setProject(config.public.appwriteProjectId);
  const apiKey = config.appwriteApiKey;
  if (import.meta.server && apiKey) {
    client.setKey(apiKey);
  }

  // Memoize for reuse on server
  if (import.meta.server) {
    memoizedClient = client;
  }

  return client;
}

export function createAppwriteServices() {
  const client = createAppwriteClient();
  const config = useRuntimeConfig();
  const hasServerKey = Boolean(import.meta.server && config.appwriteApiKey);
  return {
    account: new Account(client),
    databases: new Databases(client),
    storage: new Storage(client),
    users: hasServerKey ? new Users(client) : null,
    ID,
  };
}

export type AppwriteServices = ReturnType<typeof createAppwriteServices>;
