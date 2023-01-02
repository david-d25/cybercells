const { defineConfig } = require('@vue/cli-service')
const path = require('path');

module.exports = defineConfig({
  publicPath: process.env.NODE_ENV === "production" ? "./" : "/",
  transpileDependencies: true,
  devServer: {
    host: 'localhost'
  },
  configureWebpack: {
    resolve: {
      alias: {
        '@public': path.resolve(__dirname, 'public'),
        '@': path.resolve(__dirname, 'src'),
      }
    }
  }
})
