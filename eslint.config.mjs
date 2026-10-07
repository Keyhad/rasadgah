import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

const layer = (files, forbidden, message) => ({
  files,
  ignores: ['**/*.test.*'],
  rules: {
    'no-restricted-imports': ['error', { patterns: [{ group: forbidden, message }] }],
  },
});

const config = [
  {
    ignores: [
      '.next/**',
      'coverage/**',
      'playwright-report/**',
      'test-results/**',
      'next-env.d.ts',
    ],
  },
  ...nextVitals,
  ...nextTypescript,
  // Clean-architecture boundaries: dependencies only point inwards.
  layer(
    ['src/domain/**'],
    ['@/application/*', '@/infrastructure/*', '@/presentation/*', '@/server/*', 'next', 'next/*', 'react', 'zod'],
    'The domain layer must stay framework-free.',
  ),
  layer(
    ['src/application/**'],
    ['@/infrastructure/*', '@/presentation/*', '@/server/*', 'next', 'next/*', 'react'],
    'The application layer may only depend on the domain.',
  ),
  layer(
    ['src/infrastructure/**'],
    ['@/presentation/*', '@/server/*', 'next', 'next/*', 'react'],
    'Infrastructure must not depend on presentation.',
  ),
  layer(
    ['src/presentation/**'],
    ['@/server/*'],
    'Presentation receives dependencies; it must not reach into the composition root.',
  ),
];

export default config;
