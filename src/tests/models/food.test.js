import mongoose from 'mongoose';
import { FoodModel } from '../../models/food.model.js';

describe('Food Model Test', () => {
    it('should create & save food item successfully', async () => {
        const validFood = new FoodModel({
            name: 'Pizza',
            price: 10.99,
            imageUrl: 'http://example.com/pizza.jpg',
            origins: ['Italy'],
            cookTime: '30-40',
        });
        const savedFood = await validFood.save();
        
        expect(savedFood._id).toBeDefined();
        expect(savedFood.name).toBe(validFood.name);
        expect(savedFood.price).toBe(validFood.price);
    });

    it('should fail to save food without required fields', async () => {
        const foodWithoutRequiredField = new FoodModel({ name: 'Pizza' });
        let err;
        
        try {
            await foodWithoutRequiredField.save();
        } catch (error) {
            err = error;
        }
        
        expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    });
}); 