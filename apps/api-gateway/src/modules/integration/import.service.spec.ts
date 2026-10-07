import { ImportParserService } from './import.service';

describe('ImportParserService', () => {
  let service: ImportParserService;

  beforeEach(() => {
    service = new ImportParserService();
  });

  it('should parse a basic OpenAPI JSON', async () => {
    const content = JSON.stringify({
      openapi: '3.0.0',
      info: { title: 'Test API' },
      servers: [{ url: 'https://api.example.com/v1' }],
      paths: {
        '/users': {
          get: { summary: 'Get Users' },
        },
      },
    });

    const result = await service.parseFileOrText(content, 'test.json');
    expect(result.systemName).toBe('Test API');
    expect(result.baseUrl).toBe('https://api.example.com/v1');
    expect(result.endpoints).toHaveLength(1);
    expect(result.endpoints[0].method).toBe('GET');
    expect(result.endpoints[0].path).toBe('/users');
  });
});
