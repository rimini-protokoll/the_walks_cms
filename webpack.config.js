const path = require('path')
const exec = require('child_process').exec;


module.exports = {
  entry: './src/cms.js',
  mode: 'production',
//  mode: 'development',
  output: {
    path: path.resolve(__dirname, '../static/admin/cms')
  },
  plugins: [
    {
      apply: (compiler) => {
        compiler.hooks.afterEmit.tap('AfterEmitPlugin', (compilation) => {
          exec('cp dist/admin/cms.js ../static/admin/', (err, stdout, stderr) => {
            if (stdout) process.stdout.write(stdout);
            if (stderr) process.stderr.write(stderr);
          });
        });
      }
    }
  ],
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options:
        {
          presets: ['@babel/preset-react', '@babel/preset-env']
        }
      }
    ]
  }
}
