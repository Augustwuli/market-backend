const Joi = require('joi');
const Path = require('path');
const GROUP_NAME = 'static';

module.exports = [
  {
    method: 'GET',
    path: '/public/resources/imgs/{path}',
    handler: {
      file: function (request) {
        return Path.join(__dirname, `../public/resources/imgs/${request.params.path}`);
      }
    },
    config: {
      validate: {
        params: {
          path: Joi.string().required(),
        }
      },
      tags: ['api', GROUP_NAME],
      description: '返回图片',
      auth: false
    },
  }
];