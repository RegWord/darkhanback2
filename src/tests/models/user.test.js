import mongoose from 'mongoose';
import { UserModel } from '../../models/user.model.js';

describe('User Model Test', () => {
    it('should create & save user successfully', async () => {
        const validUser = new UserModel({
            name: 'John Doe',
            email: 'john@example.com',
            password: 'password123',
            address: '123 Test St',
        });
        const savedUser = await validUser.save();
        
        expect(savedUser._id).toBeDefined();
        expect(savedUser.name).toBe(validUser.name);
        expect(savedUser.email).toBe(validUser.email);
    });

    it('should fail to save user without required fields', async () => {
        const userWithoutRequiredField = new UserModel({ name: 'John Doe' });
        let err;
        
        try {
            await userWithoutRequiredField.save();
        } catch (error) {
            err = error;
        }
        
        expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    });
}); 