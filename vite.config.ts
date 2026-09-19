import path from 'path';
import fs from 'node:fs';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

const buildVersion = new Date().toISOString().replace(/[:.]/g, '-');

function swVersionPlugin(): Plugin {
  return {
    name: 'sw-version',
    async closeBundle() {
      const fs = await import('node:fs/promises');
      const swPath = path.resolve(__dirname, 'dist', 'sw.js');
      try {
        const content = await fs.readFile(swPath, 'utf8');
        await fs.writeFile(swPath, content.replace('__BUILD_VERSION__', buildVersion));
      } catch {}
    },
  };
}

function siteConfigHtmlPlugin(): Plugin {
  return {
    name: 'site-config-html',
    transformIndexHtml(html) {
      const configPath = path.resolve(__dirname, 'public', 'site-config.json');
      if (!fs.existsSync(configPath)) {
        console.warn('[vite] site-config.json not found');
        return html;
      }
      // 保留你原有的 HTML 转换逻辑
      return html;
    },
  };
}

export default defineConfig({
  base: '/EDU-PUBLISH/', // 👈 已添加：解决 GitHub Pages 子路径白屏问题
  plugins: [
    react(),
    swVersionPlugin(),
    siteConfigHtmlPlugin(),
  ],
  // 如果你原文件底部还有 resolve、server 等其他配置，可以保留在下方，例如：
  // resolve: {
  //   alias: { '@': path.resolve(__dirname, 'src') },
  // },
});
