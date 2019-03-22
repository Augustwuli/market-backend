const models = require('../node_modules/.bin/models')
const Joi  = require('joi')
const GROUP_NAME = 'users';

module.exports = [
  {
    method: 'POST',
    path: `/${GROUP_NAME}/login`,
    handler: async (request, reply)=>{
      const { userName, password, type } = request.payload;
      let result = {
        success: false,
        message: '登录失败',
        data: {},
        statu: 0
      }
      await models.users.findOne({
        where: {
          'name': userName,
          'type': type
        }
      }).then((user) => {
        if(user){
          let pwd = user.get('password');
          let id = user.get('id');
          if(pwd === password){
            result.success = true;
            result.message = '登录成功';
            result.data.userId = id;
            result.statu = 1;
          }
        }else{
          result.success = true;
          result.message = '没有此用户';
        }
      }).catch((err) => {
        console.log(err)
        console.log('查找用户失败')
      })
      reply(result);
    },
    config: {
      validate: {
        payload: {
          userName: Joi.string().required(),
          password: Joi.string().required(),
          type: Joi.number().required()
        }
      },
      tags: ['api', GROUP_NAME],
      description: '登录接口'
    }
  },
  {
    method: 'POST',
    path: `/${GROUP_NAME}/sign`,
    handler: async (request, reply)=>{
      const { userName, password,phone} = request.payload;
      let result = {
        success: false,
        message: '注册失败',
        data: {},
        statu: 0
      }
      await models.users.upsert({
        'name': userName,
        'password': password,
        'phone': phone,
        'type': 1
      }).then((user) => {
        if(user){
          result.success = true;
          result.message = '注册成功';
          result.statu = 1;
        }else{
          result.success = true;
          result.message = '注册失败';
        }
      }).catch((err) => {
        console.log(err)
        console.log('注册用户失败')
      })
      reply(result);
    },
    config: {
      validate: {
        payload: {
          userName: Joi.string().required(),
          password: Joi.string().required(),
          phone: Joi.string().required(),
        }
      },
      tags: ['api', GROUP_NAME],
      description: '登录接口'
    }
  }
]