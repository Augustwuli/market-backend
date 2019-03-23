const models = require('../node_modules/.bin/models')
const Joi  = require('joi')
const GROUP_NAME = 'carts';
const { paginationDefine } = require('../utils/router-helper');
models.carts.belongsTo(models.products, {foreignKey:'product_id',as:'products'});

module.exports = [
  {
    method: 'GET',
    path: `/${GROUP_NAME}/{userId}`,
    handler: async (request, reply) => {
      const { userId } = request.params;
      let result = {
        success: false,
        message: '获取购物车列表',
        data: {},
        statu: 0
      }
      await models.carts.findAndCountAll({
        include:[{
          model: models.products,
          as: 'products',
          attributes: ['id','title','thumb_url','price'] 
        }],
        attributes: ['id', 'num'],
        where:{
          user_id: userId
        },
        limit: request.query.limit,
        offset: (request.query.page - 1) * request.query.limit,
      }).then((carts) => {
        if(carts){
          result.success = true;
          result.message = '获取购物车列表成功';
          result.data.carts = carts.rows;
          result.data.count = carts.count;
        }
      }).catch((err) => {
        console.error('获取购物车列表失败');
        console.log(err)
      })
      reply(result);
    },
    config: {
      validate :{
        params: {
          userId: Joi.number().required(),
        },
        query: {
          ...paginationDefine
        }
      },
      tags: ['api', GROUP_NAME],
      description: '获取购物车列表',
      auth: false,
    }
  },
  {
    method: 'POST',
    path: `/${GROUP_NAME}/add`,
    handler: async (request, reply)=>{
      const { userId, productId } = request.payload;
      let result = {
        success: false,
        message: '加入购物车',
        data: {},
        statu: 0
      }
      await models.carts.upsert({
        'user_id': userId,
        'product_id': productId,
        'num': 1
      }).then((product) => {
        if(product){
          result.success = true;
          result.message = '加入购物车成功';
          result.statu = 1;
        }else{
          result.success = true;
          result.message = '加入购物车失败';
        }
      }).catch((err) => {
        console.log(err)
        console.log('加入购物车失败')
      })
      reply(result);
    },
    config: {
      validate: {
        payload: {
          userId: Joi.number().required(),
          productId: Joi.number().required(),
        }
      },
      tags: ['api', GROUP_NAME],
      description: '加入购物车接口'
    }
  },
  {
    method: 'POST',
    path: `/${GROUP_NAME}/delete`,
    handler: async (request, reply)=>{
      const { id } = request.payload;
      let result = {
        success: false,
        message: '删除购物车',
        data: {},
        statu: 0
      }
      await models.carts.destroy({
        where: {
          id: id
        }
      }).then((cart) => {
        result.success = true;
        result.message = '删除购物车成功';
        result.statu = 1;
      }).catch((err) => {
        console.log('删除购物车失败')
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
      description: '删除购物车接口'
    }
  }
]