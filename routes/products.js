const models = require('../node_modules/.bin/models')
const Sequelize = require('sequelize')
const Op = Sequelize.Op
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
    method: 'POST',
    path: `/${GROUP_NAME}/save`,
    handler: async (request, reply)=>{
      const { title, price, num, content, image ,id ,isUpload} = request.payload;
      let result = {
        success: false,
        message: '编辑失败',
        data: {},
        statu: 0
      }
      let data = {
        title: title,
        price: price,
        num: num,
        content: content,
      }
      if(isUpload === true){
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
        data.thumb_url = path;
      }
      await models.products.update(
        data,
        {
          where: {
            id: id
          }
      }).then((product) => {
        if(product){
          result.success = true;
          result.message = '编辑成功';
          result.statu = 1;
        }else{
          result.success = true;
          result.message = '编辑失败';
        }
      }).catch((err) => {
        console.log(err)
        console.log('编辑产品失败')
      })
      reply(result);
    },
    config: {
      validate: {
        payload: {
          id: Joi.string().required(),
          title: Joi.string().required(),
          price: Joi.string().required(),
          num: Joi.number().required(),
          content: Joi.string().required(),
          image: Joi.string().required(),
          isUpload: Joi.boolean().required()
        }
      },
      tags: ['api', GROUP_NAME],
      description: '编辑产品接口'
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
        attributes: ['id', 'title', 'price', 'thumb_url'],
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
  },
  {
    method: 'GET',
    path: `/${GROUP_NAME}/search/{keyword}`,
    handler: async (request, reply) => {
      const { keyword } = request.params;
      let result = {
        success: false,
        message: '搜索产品失败',
        data: {},
        statu: 0
      }
      await models.products.findAndCountAll({
        attributes: ['id', 'title', 'price', 'thumb_url'],
        where:{
          title: {
            [Op.like]: `%${keyword}%`,
          }
        },
        limit: request.query.limit,
        offset: (request.query.page - 1) * request.query.limit,
      }).then((products) => {
        result.success = true;
        result.message = '搜索产品成功';
        result.data.products = products.rows;
        result.data.count = products.count;
      }).catch((err) => {
        console.error('搜索产品失败');
        console.log(err)
      })
      reply(result);
    },
    config: {
      validate :{
        query: {
          ...paginationDefine
        },
        params: {
          keyword: Joi.string().required(),
        },
      },
      tags: ['api', GROUP_NAME],
      description: '获取产品列表',
      auth: false,
    }
  },
  {
    method: 'GET',
    path: `/${GROUP_NAME}/detail/{id}`,
    handler: async (request, reply) => {
      const { id } = request.params;
      let result = {
        success: false,
        message: '获取产品详情',
        data: {},
        statu: 0
      }
      await models.products.findOne({
        where: {
          'id': id
        }
      }).then((product) => {
        result.success = true;
        if(product){
          result.data.thumb_url = product.get('thumb_url');
          result.data.title = product.get('title');
          result.data.content = product.get('content');
          result.data.price = product.get('price');
          result.data.num = product.get('num');
          result.statu = 1;
          result.message = "获取产品详情成功"
        }else{
          result.statu = 0;
          result.message = "获取产品详情失败"
        }
      }).catch((err) => {
        console.error('获取产品详情失败');
        console.log(err)
      })
      reply(result);
    },
    config: {
      validate :{
        params: {
          id: Joi.number().required(),
        },
      },
      tags: ['api', GROUP_NAME],
      description: '获取产品列表',
      auth: false,
    }
  },
  {
    method: 'GET',
    path: `/${GROUP_NAME}/manager`,
    handler: async (request, reply) => {
      let result = {
        success: false,
        message: '获取产品失败',
        data: {},
        statu: 0
      }
      await models.products.findAndCountAll({
        attributes: ['id', 'title', 'price', 'num'],
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
  },
  {
    method: 'POST',
    path: `/${GROUP_NAME}/delete`,
    handler: async (request, reply)=>{
      const { id } = request.payload;
      let result = {
        success: false,
        message: '删除产品失败',
        data: {},
        statu: 0
      }
      await models.products.destroy({
        where: {
          id: id
        }
      }).then((product) => {
        models.carts.destroy({
          where: {
            'product_id': id
          }
        }).then((cart) => {
          result.success = true;
          result.message = '删除购物车成功';
          result.statu = 1;
        }).catch((err) => {
          console.log('删除购物车失败')
          console.log(err)
        })
        result.success = true;
        result.message = '删除产品成功';
        result.statu = 1;
      }).catch((err) => {
        console.log('删除产品失败')
        console.log(err)
      })
      reply(result);
    },
    config: {
      validate: {
        payload: {
          id: Joi.number().required()
        }
      },
      tags: ['api', GROUP_NAME],
      description: '删除产品接口'
    }
  },
  // {
  //   method: 'GET',
  //   path: `/${GROUP_NAME}/edit/{id}`,
  //   handler: async (request, reply) => {
  //     const { id } = request.params;
  //     let result = {
  //       success: false,
  //       message: '获取产品信息',
  //       data: {},
  //       statu: 0
  //     }
  //     await models.products.findOne({
  //       where: {
  //         'id': id
  //       }
  //     }).then((product) => {
  //       result.success = true;
  //       if(product){
  //         result.data.thumb_url = product.get('thumb_url');
  //         result.data.title = product.get('title');
  //         result.data.content = product.get('content');
  //         result.data.price = product.get('price');
  //         result.data.num = product.get('num');
  //         result.statu = 1;
  //         result.message = "获取产品成功"
  //       }else{
  //         result.statu = 0;
  //         result.message = "获取产品失败"
  //       }
  //     }).catch((err) => {
  //       console.error('获取产品失败');
  //       console.log(err)
  //     })
  //     reply(result);
  //   },
  //   config: {
  //     validate :{
  //       params: {
  //         id: Joi.number().required(),
  //       },
  //     },
  //     tags: ['api', GROUP_NAME],
  //     description: '获取产品列表',
  //     auth: false,
  //   }
  // }
]