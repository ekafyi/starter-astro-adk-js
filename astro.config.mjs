// @ts-check
import { defineConfig } from 'astro/config';

import netlify from '@astrojs/netlify';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';

import db from '@astrojs/db';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: netlify(),

  vite: {
    plugins: [tailwindcss()],
    ssr: {
      external: [
        '@google-cloud/storage',
        '@google-cloud/opentelemetry-cloud-monitoring-exporter',
        '@google-cloud/opentelemetry-cloud-trace-exporter',
        '@opentelemetry/sdk-logs',
        '@opentelemetry/sdk-metrics',
        '@opentelemetry/sdk-trace-node',
        '@opentelemetry/exporter-trace-otlp-http',
        '@opentelemetry/exporter-metrics-otlp-http',
        '@opentelemetry/exporter-logs-otlp-http',
      ]
    }
  },

  integrations: [react(), db()]
});