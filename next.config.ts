// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  compiler: {
    styledComponents: true,
  },
  turbopack: {
    rules: {
      '*.svg': {
        loaders: [
          {
            loader: '@svgr/webpack',
            options: {
              svgo: true,
              svgoConfig: {
                plugins: [
                  { name: 'removeDimensions', active: true },
                  {
                    name: 'removeAttrs',
                    params: { attrs: '(stroke-width|stroke)' },
                  },
                  {
                    name: 'addAttributesToSVGElement',
                    params: {
                      attributes: [
                        { stroke: 'currentColor' },
                        { vectorEffect: 'non-scaling-stroke' },
                        { preserveAspectRatio: 'xMidYMid meet' },
                      ],
                    },
                  },
                ],
              },
            },
          },
        ],
        as: '*.js',
      },
    },
  },
  images: {
    disableStaticImages: true, // importした画像の型定義設定を無効にする
  },
}

export default nextConfig
