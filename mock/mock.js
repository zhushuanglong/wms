/**
 * @Description: mock
 * @Author: yunfan
 * @note   setOnline 线上接口 配置
 * @param  name  本地接口名
 *         type  接口类型
 *         url   线上接口地址
 */
var fs = require('fs')
var setOnline = [
  //- 用户管理 -//
  {
    name: 'userLogin',
    type: 'post',
    url: '/user/login'
  },
  {
    name: 'userInfo',
    type: 'get',
    url: '/user/info'
  },
  {
    name: 'userLogout',
    type: 'get',
    url: '/user/logout'
  },

  //- 采购管理 -//
  // 采购订单
  {
    name: 'purchasingList',
    type: 'get',
    url: '/purchasing/list'
  },
  // 供应商名单
  {
    name: 'suppliers',
    type: 'get',
    url: '/suppliers'
  },
  // 供应商 - 列表
  {
    name: 'supplierList',
    type: 'get',
    url: '/supplier/list'
  },
  // 供应商 - 新增
  {
    name: 'supplierCreate',
    type: 'get',
    url: '/supplier/create'
  },
  // 供应商 - 编辑
  {
    name: 'supplierEdit',
    type: 'get',
    url: '/supplier/edit'
  },



  //- xx管理 -//
]

// 输出配置项
exports.setOnline = setOnline

// 遍历输出json数据
for (var i = 0, len = setOnline.length; i < len; i++) {
  (function() {
    var name = setOnline[i].name

    exports[name] = function(req, res) {
      res.setHeader('Content-Type', 'application/json; charset=utf-8')
      fs.readFile('./mock/' + name + '.json', function(err, data) {
        if (err) throw err
        let randomTime = Math.floor(Math.random() * 100) * 10
        setTimeout(function() {
          res.json(JSON.parse(data))
        }, randomTime)
      })
    }
  })(i)
}
