import { describe, it, expect } from 'vitest';
import { createEmptyArchModel } from '../../src/model/archModel.js';
import { linkCrossLanguageComponents } from '../../src/graph/crossLanguage.js';

describe('Cross-Language Linker', () => {
  it('links HTTP client calls in one component to matching REST interface in another project', () => {
    const model = createEmptyArchModel('CrossLangTest');
    model.projects.push({
      id: 'proj-backend',
      name: 'node-api',
      type: 'backend-api',
      languages: ['.ts'],
      frameworks: ['Express'],
      rootPath: 'node-api',
      entryPoints: [],
      loc: 100,
      fileCount: 5,
    });

    model.components.push(
      {
        id: 'comp-flutter',
        name: 'FlutterWidget',
        type: 'Screen',
        projectId: 'proj-flutter',
        layer: 'presentation',
        paths: ['flutter/main.dart'],
        publicSymbols: [],
        loc: 50,
        fanIn: 0,
        fanOut: 1,
        hasTests: false,
        isKey: false,
        confidence: 'Extracted',
        evidence: [],
      },
      {
        id: 'comp-express',
        name: 'OrderController',
        type: 'Controller',
        projectId: 'proj-backend',
        layer: 'presentation',
        paths: ['node-api/index.ts'],
        publicSymbols: [],
        loc: 80,
        fanIn: 1,
        fanOut: 0,
        hasTests: true,
        isKey: true,
        confidence: 'Extracted',
        evidence: [],
      }
    );

    model.interfaces.push({
      id: 'iface-orders',
      projectId: 'proj-backend',
      kind: 'rest',
      method: 'GET',
      path: '/orders',
      handler: 'OrderController.getOrders',
      file: 'node-api/index.ts',
    });

    model.relationships.push({
      id: 'rel-http-client',
      fromId: 'comp-flutter',
      toId: 'http-/orders',
      kind: 'http',
      label: 'HTTP GET /orders',
      evidence: [],
      confidence: 'Extracted',
    });

    linkCrossLanguageComponents(model);

    const crossLink = model.relationships.find(r => r.id.startsWith('cross-http-'));
    expect(crossLink).toBeDefined();
    expect(crossLink?.fromId).toBe('comp-flutter');
    expect(crossLink?.toId).toBe('comp-express');
  });
});
