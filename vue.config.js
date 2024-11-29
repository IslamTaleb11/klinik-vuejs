module.exports = {
    devServer: {
      proxy: {
        '^/users': {
          target: 'http://localhost:3000/',
          ws: true,
          changeOrigin: true
        },
      }
    }
  }