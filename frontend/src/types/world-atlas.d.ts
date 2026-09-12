/**
 * Ambient typing for the pre-built TopoJSON shipped by the `world-atlas` package.
 *
 * Declared by hand rather than switching on `resolveJsonModule` on purpose: letting
 * TypeScript infer the literal type of a 55 kB arc array is needlessly slow, and the
 * only thing we actually need to know is that the file is a `Topology` whose single
 * object is the merged landmass. The bundler (esbuild) still loads the real JSON.
 */
declare module 'world-atlas/land-110m.json' {
  import type { GeometryCollection, Topology } from 'topojson-specification';

  const topology: Topology<{ land: GeometryCollection }>;
  export default topology;
}
