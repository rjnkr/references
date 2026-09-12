import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  // Multi-file schema: every model lives in its own file under prisma/schema/,
  // with datasource/generator blocks in prisma/schema/schema.prisma.
  schema: 'prisma/schema',
  migrations: {
    path: 'prisma/schema/migrations',
    seed: 'tsx prisma/seed.ts',
  },
});
