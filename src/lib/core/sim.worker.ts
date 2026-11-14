import { simulate, type SimInput } from './montecarlo';

self.onmessage = (e: MessageEvent<{ id: number; input: SimInput }>) => {
  (self as unknown as Worker).postMessage({ id: e.data.id, result: simulate(e.data.input) });
};
