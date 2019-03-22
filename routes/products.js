const models = require('../node_modules/.bin/models')
const Joi  = require('joi')
const fs = require('fs')
const GROUP_NAME = 'products';
const { paginationDefine } = require('../utils/router-helper');

module.exports = [
  {
    method: 'POST',
    path: `/${GROUP_NAME}/add`,
    handler: async (request, reply)=>{
      const { title, price, num, content, image } = request.payload;
      let result = {
        success: false,
        message: '添加失败',
        data: {},
        statu: 0
      }
      let path = 'public/resources/imgs/'+ Date.now() +'.jpg';
      let base64 = image.replace(/^data:image\/\w+;base64,/, "");
      let dataBuffer = new Buffer(base64, 'base64');
      console.log('dataBuffer是否是Buffer对象：'+Buffer.isBuffer(dataBuffer));
      fs.writeFile(path,dataBuffer,function(err){
        if(err){
            console.log(err);
        }else{
           console.log('写入成功！');
        }
      })
      await models.products.upsert({
        'title': title,
        'price': price,
        'num': num,
        'content': content,
        'thumb_url': path
      }).then((product) => {
        if(product){
          result.success = true;
          result.message = '添加成功';
          result.statu = 1;
        }else{
          result.success = true;
          result.message = '添加失败';
        }
      }).catch((err) => {
        console.log(err)
        console.log('添加产品失败')
      })
      reply(result);
    },
    config: {
      validate: {
        payload: {
          title: Joi.string().required(),
          price: Joi.string().required(),
          num: Joi.number().required(),
          content: Joi.string().required(),
          image: Joi.string().required(),
        }
      },
      tags: ['api', GROUP_NAME],
      description: '添加产品接口'
    }
  },
  {
    method: 'GET',
    path: `/${GROUP_NAME}/list`,
    handler: async (request, reply) => {
      let result = {
        success: false,
        message: '获取产品失败',
        data: {},
        statu: 0
      }
      await models.products.findAndCountAll({
        attributes: ['id', 'title', 'price'],
        limit: request.query.limit,
        offset: (request.query.page - 1) * request.query.limit,
      }).then((products) => {
        result.success = true;
        result.message = '获取产品成功';
        result.data.products = products.rows;
        result.data.count = products.count;
      }).catch((err) => {
        console.error('获取产品失败');
        console.log(err)
      })
      reply(result);
    },
    config: {
      validate :{
        query: {
          ...paginationDefine
        }
      },
      tags: ['api', GROUP_NAME],
      description: '获取产品列表',
      auth: false,
    }
  }
]