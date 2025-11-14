import { Client, Account, Databases, Storage, ID } from "appwrite";

export function createAppwriteClient() {
  const config = useRuntimeConfig();
  const client = new Client();
  client
    .setEndpoint(config.public.appwriteEndpoint)
    .setProject(config.public.appwriteProjectId);
  return client;
}

export function createAppwriteServices() {
  const client = createAppwriteClient();
  return {
    account: new Account(client),
    databases: new Databases(client),
    storage: new Storage(client),
    ID,
  };
}

export type AppwriteServices = ReturnType<typeof createAppwriteServices>;
