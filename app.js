const Hapi = require('hapi');
require('env2')('./.env');
const config = require('./config');
const hello = require('./routes/hello');
const pluginHapiSwagger = require('./plugins/hapi-swagger');

const server = new Hapi.Server();
// 配置服务器启动的 host 和端口
server.connection({
  host: config.host,
  port: config.port
})
const init = async () => {
  await server.register([
    // 为系统使用 hapi-swagger
    ...pluginHapiSwagger,
  ]);
  server.route([
    ...hello,
  ])
  await server.start();
  console.log(`Server running at: ${server.info.uri}`);
}

init();