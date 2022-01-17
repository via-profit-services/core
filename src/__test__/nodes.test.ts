import { extractNodeField, extractNodeIds } from '../utils/nodes';

describe('Nodes', () => {
  test('Extract node field. Should return array of fields of node', () => {
    const result = extractNodeField(
      [
        { id: '1', label: 'one' },
        { id: '2', label: 'two' },
      ],
      'label',
    );
    expect(result).toEqual(['one', 'two']);
  });

  test('Extract node IDs. Should return node IDs array', () => {
    const result = extractNodeIds([
      { id: '1', label: 'one' },
      { id: '2', label: 'two' },
    ]);
    expect(result).toEqual(['1', '2']);
  });
});
