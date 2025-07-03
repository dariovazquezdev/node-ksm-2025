const { app, closeServer } = require('../index');
const request = require('supertest');
const { waitForDbInit } = require("../database");

// Max timeout 60 seconds
jest.setTimeout(60000);

// Before all tests, ensure the database is initialized
beforeAll(async () => {
    process.env.NODE_ENV = "test";
    // Wait for database initialization to complete
    await waitForDbInit();
});


// Basic tests that should pass quickly
test('GET /recipes - should return recipes', async () => {
    const response = await request(app).get('/api/recipes');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
});
