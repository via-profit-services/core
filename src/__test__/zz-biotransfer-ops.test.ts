// TEMPORARY analysis, not committed: runs the operations of the biotransfer clients
// through the 2.11 depth / width / complexity rules.
import fs from 'node:fs';
import path from 'node:path';
import { buildSchema, parse, validate, Kind, type DefinitionNode, type FragmentDefinitionNode, type OperationDefinitionNode, visit } from 'graphql';
import depthLimit from '../validation/depth-limit-rule';
import complexityLimit from '../validation/complexity-limit-rule';

const ROOT = '/home/admin/Projects/biotransfer';
const dummy = buildSchema('type Query { x: Int }');

const walk = (dir: string, ext: string): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap(e =>
    e.isDirectory() ? walk(path.join(dir, e.name), ext) : e.name.endsWith(ext) ? [path.join(dir, e.name)] : [],
  );

const collect = () => {
  const docs: { app: string; text: string }[] = [];
  for (const file of walk(`${ROOT}/crm/src/relay/artifacts`, '.graphql.ts')) {
    const m = /"text": ("(?:[^"\\]|\\.)*")/.exec(fs.readFileSync(file, 'utf8'));
    if (m) docs.push({ app: 'crm', text: JSON.parse(m[1]) });
  }
  for (const app of ['ru.biotransfer.driver', 'ru.biotransfer.client']) {
    const all: string[] = [];
    for (const file of walk(`${ROOT}/${app}/lib`, '.dart')) {
      for (const [, lit] of fs.readFileSync(file, 'utf8').matchAll(/^(?!\s*\/\/).*?r?'''([\s\S]*?)'''/gm)) {
        if (/\b(query|mutation|subscription|fragment)\b/.test(lit)) all.push(lit);
      }
    }
    // dart apps keep fragments separately: put all definitions of the app together per operation
    const defs = all.flatMap(t => { try { return parse(t).definitions; } catch { return []; } });
    const frags = new Map(defs.filter(d => d.kind === Kind.FRAGMENT_DEFINITION).map(d => [(d as FragmentDefinitionNode).name.value, d as FragmentDefinitionNode]));
    for (const op of defs.filter(d => d.kind === Kind.OPERATION_DEFINITION) as OperationDefinitionNode[]) {
      const used = new Map<string, DefinitionNode>();
      const rec = (n: DefinitionNode) => visit(n, { FragmentSpread(s) { const f = frags.get(s.name.value); if (f && !used.has(s.name.value)) { used.set(s.name.value, f); rec(f); } } });
      rec(op);
      docs.push({ app: app.replace('ru.biotransfer.', ''), text: { kind: Kind.DOCUMENT, definitions: [op, ...used.values()] } as never });
    }
  }
  return docs;
};

test('biotransfer operations vs 2.11 limits', () => {
  const docs = collect();
  const rows: string[] = [];
  const stats = { total: 0, depth: 0, width: 0, c20: 0, c50: 0, c100: 0, tokens: 0 };
  let maxWidthSeen = 0;
  const top: [number, string][] = [];
  const depths: [number, string][] = [];

  for (const { app, text } of docs) {
    const doc = typeof text === 'string' ? parse(text) : (text as never);
    for (const op of doc.definitions.filter((d: DefinitionNode) => d.kind === Kind.OPERATION_DEFINITION) as OperationDefinitionNode[]) {
      stats.total++;
      const one = { ...doc, definitions: [op, ...doc.definitions.filter((d: DefinitionNode) => d.kind !== Kind.OPERATION_DEFINITION)] };
      const name = `${app}: ${op.name?.value}`;
      const intVars = Object.fromEntries((op.variableDefinitions ?? []).map(v => [v.variable.name.value, 0]));
      const complexityAt = (n: number) => {
        let c = 0;
        const vars = Object.fromEntries(Object.keys(intVars).map(k => [k, n]));
        validate(dummy, one, [complexityLimit({ maxComplexity: Infinity, onComplete: x => (c = x), variables: vars })]);
        return c;
      };
      const depthErr = validate(dummy, one, [depthLimit({ maxDepth: 20, maxIntrospectionDepth: 20 })]);
      let width = 0;
      visit(one, { SelectionSet(s) { width = Math.max(width, s.selections.filter(x => x.kind === Kind.FIELD).length); } });
      maxWidthSeen = Math.max(maxWidthSeen, width);
      const [c20, c50, c100] = [complexityAt(20), complexityAt(50), complexityAt(100)];
      top.push([complexityAt(30), name]);
      const exact: Record<string, Record<string, number>> = {
        'driver: LoadingHistoryShiftQuery': { history_shift_first: 1, history_shift_completed_orders_first: 30, history_shift_cancelled_orders_first: 30, history_shift_photos_first: 6 },
        'driver: PageCompletedShiftQuery': { history_shift_first: 1, history_shift_completed_orders_first: 30 },
        'driver: PageCancelledShiftQuery': { history_shift_first: 1, history_shift_cancelled_orders_first: 30 },
        'driver: PagePhotoShiftQuery': { history_shift_first: 1, history_shift_photos_first: 6 },
        'crm: WorkingHoursDayDialogQuery': { first: 10 },
        'crm: DayDialogInnerRefetchableQuery': { first: 10 },
        'crm: AddressesPointQuery': { first: 9999 },
        'crm: PointsAddressEditFormQuery': { first: 999 },
        'crm: UnifiedPlanerQuery': { first: 30 },
        'crm: OrdersPlanerQuery': { first: 30 },
      };
      if (exact[name]) {
        let c = 0;
        validate(dummy, one, [complexityLimit({ maxComplexity: Infinity, onComplete: x => (c = x), variables: exact[name] })]);
        rows.push(`EXACT ${c}  ${name} ${JSON.stringify(exact[name])}`);
      }
      if (/AddressesPointQuery|PointsAddressEditForm/.test(name)) rows.push(`SPECIFIC 999:${complexityAt(999)} 9999:${complexityAt(9999)}  ${name}`);
      let d = 1; while (validate(dummy, one, [depthLimit({ maxDepth: d, maxIntrospectionDepth: d })]).length) d++;
      depths.push([d, name]);
      if (depthErr.length) { stats.depth++; rows.push(`DEPTH>20  ${name}`); }
      if (width > 50) { stats.width++; rows.push(`WIDTH ${width}  ${name}`); }
      if (c20 > 5000) stats.c20++;
      if (c50 > 5000) stats.c50++;
      if (c100 > 5000) stats.c100++;
      if (c20 > 5000 || c50 > 5000) rows.push(`COMPLEXITY 20:${c20} 50:${c50} 100:${c100}  ${name}`);
    }
  }
  top.sort((a, b) => b[0] - a[0]);
  depths.sort((a, b) => b[0] - a[0]);
  const hist: Record<number, number> = {}; depths.forEach(([d]) => (hist[d] = (hist[d] ?? 0) + 1));
  const cs = top.map(([c]) => c).sort((a, b) => a - b); const q = (x: number) => cs[Math.floor((cs.length - 1) * x)];
  console.log('DEPTH hist', JSON.stringify(hist), '\nDEPTH top', depths.slice(0, 8).map(([d, n]) => `${d} ${n}`).join('; '), '\nCOMPLEXITY@30 p50', q(0.5), 'p90', q(0.9), 'p99', q(0.99), 'max', cs[cs.length - 1]);
  console.log(JSON.stringify({ ...stats, maxWidthSeen }), '\n' + rows.filter(r => r.startsWith('EXACT')).sort((a,b)=>Number(b.split(' ')[1])-Number(a.split(' ')[1])).join('\n'), '\nTOP at 30:\n' + top.slice(0, 15).map(([c, n]) => `${c}  ${n}`).join('\n'));
});
