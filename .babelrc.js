module.exports = (api) => {
  api.cache(true)

  const presets = [
    '@babel/preset-typescript',
    ['@babel/preset-env', { targets: { node: true } }]
  ]

  const plugins = [
    ['module-resolver', {
      root: ['./'],
      alias: {
        '@/errors': './src/errors',
        '@/helpers': './src/helpers',
        '@/middlewares': './src/middlewares',
        '@/services': './src/services',
      }
    }]
  ]

  return { presets, plugins }
}