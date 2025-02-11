import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { jest } from '@jest/globals';

let mongod;

beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = await mongod.getUri();
    await mongoose.connect(uri);
});

beforeEach(async () => {
    // Очищаем все коллекции перед каждым тестом
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany();
    }
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongod.stop();
});

afterEach(() => {
    jest.clearAllMocks();
}); 