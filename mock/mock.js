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
    name: 'login',
    type: 'post',
    url: '/login'
  },
  {
    name: 'logout',
    type: 'post',
    url: '/logout'
  },

  //- 采购管理 -//

  // 采购单 - 列表
  {
    name: 'queryPurchaseOrders',
    type: 'get',
    url: '/queryPurchaseOrders'
  },
  // 采购单 - 创建
  {
    name: 'createPurchaseOrder',
    type: 'post',
    url: '/createPurchaseOrder'
  },
  // 采购单 - 返修
  {
    name: 'returnPurchaseOrder',
    type: 'post',
    url: '/returnPurchaseOrder'
  },
  // 采购单 - 关闭
  {
    name: 'closePurchaseOrder',
    type: 'post',
    url: '/closePurchaseOrder'
  },

  // 供应商 - 列表
  {
    name: 'querySuppliers',
    type: 'get',
    url: '/querySuppliers'
  },
  // 供应商 - 新增
  {
    name: 'createSupplier',
    type: 'post',
    url: '/createSupplier'
  },
  // 供应商 - 编辑
  {
    name: 'modifySupplier',
    type: 'post',
    url: '/modifySupplier'
  },
  // 供应商 - 列表
  {
    name: 'removeSupplier',
    type: 'post',
    url: '/removeSupplier'
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
