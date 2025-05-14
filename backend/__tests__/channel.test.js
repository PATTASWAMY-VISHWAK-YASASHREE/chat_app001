const request = require('supertest');
const { Channel, User } = require('../models');
const jwt = require('jsonwebtoken');

// Mock dependencies
jest.mock('../models');
jest.mock('jsonwebtoken');

// Import the express app
let app;

describe('Channel Controller', () => {
  let mockUser;
  let mockToken;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Reset and reimport the app to ensure clean state
    jest.resetModules();
    app = require('../server');
    
    // Setup mock user and token
    mockUser = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com'
    };
    
    mockToken = 'Bearer mock-token';
    
    // Mock jwt.verify to return the user id
    jwt.verify.mockImplementation(() => ({ id: mockUser.id }));
    
    // Mock User.findByPk to return the mock user
    User.findByPk.mockResolvedValue(mockUser);
  });

  describe('GET /api/channels', () => {
    it('should get all channels', async () => {
      // Mock Channel.findAll to return channels
      const mockChannels = [
        {
          id: 1,
          name: 'general',
          description: 'General discussion',
          isPrivate: false,
          creatorId: 1
        },
        {
          id: 2,
          name: 'random',
          description: 'Random stuff',
          isPrivate: false,
          creatorId: 1
        }
      ];
      
      Channel.findAll.mockResolvedValue(mockChannels);

      // Make the request
      const res = await request(app)
        .get('/api/channels')
        .set('Authorization', mockToken);

      // Assertions
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.channels).toHaveLength(2);
      expect(res.body.channels[0].name).toBe('general');
      expect(Channel.findAll).toHaveBeenCalled();
    });
  });

  describe('POST /api/channels', () => {
    it('should create a new channel', async () => {
      // Mock Channel.create to return a new channel
      const mockChannel = {
        id: 1,
        name: 'new-channel',
        description: 'A new channel',
        isPrivate: false,
        creatorId: 1
      };
      
      Channel.create.mockResolvedValue(mockChannel);

      // Make the request
      const res = await request(app)
        .post('/api/channels')
        .set('Authorization', mockToken)
        .send({
          name: 'new-channel',
          description: 'A new channel',
          isPrivate: false
        });

      // Assertions
      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.channel).toHaveProperty('name', 'new-channel');
      expect(Channel.create).toHaveBeenCalledWith({
        name: 'new-channel',
        description: 'A new channel',
        isPrivate: false,
        creatorId: 1
      });
    });

    it('should return 400 if name is missing', async () => {
      // Make the request without a name
      const res = await request(app)
        .post('/api/channels')
        .set('Authorization', mockToken)
        .send({
          description: 'A new channel',
          isPrivate: false
        });

      // Assertions
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(Channel.create).not.toHaveBeenCalled();
    });
  });

  describe('GET /api/channels/:id', () => {
    it('should get a channel by id', async () => {
      // Mock Channel.findByPk to return a channel
      const mockChannel = {
        id: 1,
        name: 'general',
        description: 'General discussion',
        isPrivate: false,
        creatorId: 1
      };
      
      Channel.findByPk.mockResolvedValue(mockChannel);

      // Make the request
      const res = await request(app)
        .get('/api/channels/1')
        .set('Authorization', mockToken);

      // Assertions
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.channel).toHaveProperty('name', 'general');
      expect(Channel.findByPk).toHaveBeenCalledWith(1, expect.any(Object));
    });

    it('should return 404 if channel not found', async () => {
      // Mock Channel.findByPk to return null
      Channel.findByPk.mockResolvedValue(null);

      // Make the request
      const res = await request(app)
        .get('/api/channels/999')
        .set('Authorization', mockToken);

      // Assertions
      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('not found');
    });
  });
});