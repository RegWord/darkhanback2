import { MongoMemoryServer } from 'mongodb-memory-server';

export default async function globalSetup() {
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    global.__MONGO_URI__ = uri;
    global.__MONGOD__ = mongod;
} 