import { describe, it, expect } from 'vitest';
import { createEmptyArchModel } from '../../src/model/archModel.js';

describe('ArchModel', () => {
  it('creates empty arch model with default values', () => {
    const model = createEmptyArchModel('TestWorkspace');
    expect(model.schemaVersion).toBe('1.0.0');
    expect(model.workspace.name).toBe('TestWorkspace');
    expect(model.workspace.mode).toBe('No AI (rule-based)');
    expect(model.components).toEqual([]);
    expect(model.relationships).toEqual([]);
  });
});
