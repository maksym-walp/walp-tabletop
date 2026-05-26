module.exports = {
  openapi: '3.0.3',
  info: {
    title: 'WALP Tabletop API',
    version: '1.0.0',
    description: 'Gateway API documentation for auth and spells endpoints.'
  },
  servers: [
    {
      url: process.env.PUBLIC_API_BASE_URL || 'http://localhost:3000',
      description: 'API Gateway'
    }
  ],
  tags: [
    { name: 'Health' },
    { name: 'Auth' },
    { name: 'Spells' }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Помилка сервера' }
        }
      },
      RegisterRequest: {
        type: 'object',
        required: ['username', 'email', 'password'],
        properties: {
          username: { type: 'string', minLength: 3, example: 'mage123' },
          email: { type: 'string', format: 'email', example: 'mage@example.com' },
          password: { type: 'string', minLength: 6, example: 'secret123' }
        }
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'mage@example.com' },
          password: { type: 'string', example: 'secret123' }
        }
      },
      LoginResponse: {
        type: 'object',
        properties: {
          token: { type: 'string' },
          userId: { type: 'integer', example: 1 },
          username: { type: 'string', example: 'mage123' }
        }
      },
      RegisterResponse: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Користувач створений' },
          userId: { type: 'integer', example: 1 }
        }
      },
      SpellDuration: {
        type: 'object',
        properties: {
          value: { type: 'integer', nullable: true },
          unit: { type: 'string', nullable: true },
          customUnit: { type: 'string', nullable: true }
        }
      },
      Spell: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 42 },
          name: { type: 'string', example: 'Вогняний Шторм' },
          level: { type: 'integer', example: 3 },
          actions: { type: 'integer', example: 2 },
          range: { type: 'string', example: '30 футів' },
          concentration: { type: 'boolean', example: false },
          ritual: { type: 'boolean', example: false },
          traditions: {
            type: 'array',
            items: { type: 'string' },
            example: ['Аркана', 'Примал']
          },
          components: {
            type: 'array',
            items: { type: 'string' },
            example: ['V', 'S']
          },
          narrativeDescription: { type: 'string' },
          mechanicalDescription: { type: 'string' },
          hasHigherLevels: { type: 'boolean', example: true },
          higherLevels: {
            type: 'object',
            additionalProperties: { type: 'string' }
          },
          duration: { $ref: '#/components/schemas/SpellDuration' }
        }
      },
      CreateSpellRequest: {
        allOf: [{ $ref: '#/components/schemas/Spell' }],
        required: ['name', 'level', 'actions', 'range', 'duration']
      }
    }
  },
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Gateway health check',
        responses: {
          200: {
            description: 'Service is healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'ok' },
                    service: { type: 'string', example: 'api-gateway' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterRequest' }
            }
          }
        },
        responses: {
          201: {
            description: 'User created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RegisterResponse' }
              }
            }
          },
          400: { description: 'Validation error' },
          409: { description: 'User already exists' },
          500: {
            description: 'Server error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      }
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login and get JWT token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' }
            }
          }
        },
        responses: {
          200: {
            description: 'Authenticated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LoginResponse' }
              }
            }
          },
          401: { description: 'Invalid credentials' },
          500: {
            description: 'Server error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      }
    },
    '/api/spells': {
      get: {
        tags: ['Spells'],
        summary: 'Get all spells',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'List of spells',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Spell' }
                }
              }
            }
          },
          500: { description: 'Server error' }
        }
      },
      post: {
        tags: ['Spells'],
        summary: 'Create a new spell',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateSpellRequest' }
            }
          }
        },
        responses: {
          201: {
            description: 'Spell created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Spell' }
              }
            }
          },
          500: { description: 'Server error' }
        }
      }
    },
    '/api/spells/{id}': {
      get: {
        tags: ['Spells'],
        summary: 'Get spell by ID',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' }
          }
        ],
        responses: {
          200: {
            description: 'Spell found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Spell' }
              }
            }
          },
          404: { description: 'Spell not found' },
          500: { description: 'Server error' }
        }
      }
    }
  }
};