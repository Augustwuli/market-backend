module.exports = [
  {
    method: 'GET',
    path: '/hello',
    handler: (request, reply)=>{
      let result = {
        success: true,
        message: '测试成功',
        data: {},
        statu: 0
      }
      reply(result);
    },
    config: {
      tags: ['api','tests'],
      description: '测试hello'
    }
  }
]