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
  //--- 用户管理 ---//
  {
    name: 'login',
    type: 'post',
    url: '/login'
  },
  {
    name: 'common',
    type: 'post',
    url: '/logout'
  },
  
  //--- 产品管理 ---//

  // 产品管理 - 列表
  {
    name: 'queryProducts',
    type: 'get',
    url: '/queryProducts'
  },
  // 产品管理 - 导出excel
  {
    name: 'exportProducts',
    type: 'post',
    url: '/exportProducts'
  },
  // 产品管理 - 获取 产品CODE 产品标题
  {
    name: 'genProductCodeAndTitle',
    type: 'post',
    url: '/genProductCodeAndTitle'
  },
  // 产品管理 - 获取 类目 列表
  {
    name: 'queryCategories',
    type: 'get',
    url: '/queryCategories'
  },
  // 产品管理 - 获取 SKU属性 列表
  {
    name: 'querySkuPropDefs',
    type: 'get',
    url: '/querySkuPropDefs'
  },
  // 产品管理 - 获取 非SKU属性 列表
  {
    name: 'queryNonSkuCategoryPropDefs',
    type: 'get',
    url: '/queryNonSkuCategoryPropDefs'
  },
  // 产品管理 - 获取 扩展的 SKU属性
  {
    name: 'expandSkuProps',
    type: 'post',
    url: '/expandSkuProps'
  },
  // 产品管理 - 删除产品
  {
    name: 'common',
    type: 'post',
    url: '/removeProduct'
  },
  // 产品管理 - 上新产品
  {
    name: 'createProduct',
    type: 'post',
    url: '/createProduct'
  },

  //--- 采购管理 ---//

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
    name: 'common',
    type: 'post',
    url: '/returnPurchaseOrder'
  },
  // 采购单 - 关闭
  {
    name: 'common',
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
    name: 'common',
    type: 'post',
    url: '/removeSupplier'
  },


  //- 订单管理 -//
  {
    name: 'queryOrders',
    type: 'get',
    url: '/queryOrders'
  },
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
