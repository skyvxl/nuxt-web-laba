import { Client, Account, Databases, Storage, Users, ID } from "node-appwrite";

export function createAppwriteClient() {
  const config = useRuntimeConfig();
  const client = new Client();
  client
    .setEndpoint(config.public.appwriteEndpoint)
    .setProject(config.public.appwriteProjectId);
  const apiKey = config.public.appwriteApiKey;
  if (import.meta.server && apiKey) {
    client.setKey(apiKey);
  }
  return client;
}

export function createAppwriteServices() {
  const client = createAppwriteClient();
  const config = useRuntimeConfig();
  const hasServerKey = Boolean(
    import.meta.server && config.public.appwriteApiKey
  );
  return {
    account: new Account(client),
    databases: new Databases(client),
    storage: new Storage(client),
    users: hasServerKey ? new Users(client) : null,
    ID,
  };
}

export type AppwriteServices = ReturnType<typeof createAppwriteServices>;
