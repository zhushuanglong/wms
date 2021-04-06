<template>
  <div class="shopcart-container">
    <div class="header">
      <i class="el-icon-shopping-cart-2" />采购车
    </div>
    <el-select 
      v-model="params.supplierId"  
      class="filter-item mr10" 
      filterable 
      placeholder="请选择供应商"
      style="padding: 10px; width: 100%;"
      clearable
    >
      <el-option
        v-for="item in list"
        :key="item.supplierId"
        :label="item.supplierName"
        :value="item.supplierId"
      />
    </el-select>

    <div class="purchase-product-layout">
      <div class="pic">
        <img src="https://img.ltwebstatic.com/images3_app/2021/03/17/1615944232023dfc31c59d8d8ea226afeebea5907d_thumbnail_480x680.webp" />
      </div>
      <div class="info">
        <div class="title">女士颜色风格领型图案元素款式品类</div>
        <div class="sku-des">
          <div class="label">颜色：红色</div>
          <div class="label">尺码：L</div>
        </div>
        <div class="price">SAR 15.88 </div>
        <div class="number">
          <el-input-number v-model="num" @change="handleChange" :min="1" :max="99999" label="数量" size="small"></el-input-number>
        </div>
      </div>
    </div>
    <div class="purchase-product-layout">
      <div class="pic">
        <img src="https://img.ltwebstatic.com/images3_app/2021/03/17/1615944232023dfc31c59d8d8ea226afeebea5907d_thumbnail_480x680.webp" />
      </div>
      <div class="info">
        <div class="title">女士颜色风格领型图案元素款式品类</div>
        <div class="sku-des">
          <div class="label">颜色：红色</div>
          <div class="label">尺码：L</div>
        </div>
        <div class="price">SAR 15.88 </div>
        <div class="number">
          <el-input-number v-model="num" @change="handleChange" :min="1" :max="99999" label="数量" size="small"></el-input-number>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
export default {
  components: {},
  data() {
    return {
      num: 1,
      list: [
        {
          "supplierId": 1,
          "supplierName": "供应商11",
          "creationTime": "2012-02-22 15:00",
          "updateTime": "2012-02-22 15:05"
        },
        {
          "supplierId": 2,
          "supplierName": "供应商22",
          "creationTime": "2012-03-22 16:00",
          "updateTime": "2012-03-22 16:05"
        }
      ],
      params: {
        supplierId: '',
        purchaseOrderLines: [{
          skuId: 1,
          quantity: 1
        }],
        remark: ''
      }
    }
  },
  computed: {},
  methods: {
    handleChange(value) {
      console.log(value)
    }
  }
}
</script>

<style lang="scss" scoped>
.shopcart-container {
  font-size: 14px;
  .header {
    width: 100%;
    height: 50px;
    line-height: 50px;
    background: #f3f4f5;
    text-align: left;
    padding-left: 10px;
    overflow: hidden;
    font-size: 14px;
    color: #666;
    i {
      font-size: 16px;
      margin-right: 5px;
    }
  }
  
  .purchase-product-layout {
    display: flex;
    background: #FFF;
    padding: 10px;
    position: relative;
    border-bottom: 1px dashed #dcdfe6;
    
    .title {
      font-weight: bold;
      line-height: 15px;
      color: #3c3c3c;
      display: -webkit-box;
      overflow: hidden;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
    .pic {
      width: 75px;
      height: 100px;
      border: 1px solid #ccc;
      background: #ccc;
      overflow: hidden;
      margin-right: 10px;
      img {
        width: 100%;
      }
    }
    .info {
      width: 170px;
    }
    .sku-des {
      height: 15px;
      line-height: 15px;
      color: #9c9c9c;
      margin-top: 5px;
      line-height: 16px;
      font-size: 13px;
      .label {
        margin-right: 15px;
      }
    }
    .price {
      position: absolute;
      bottom: 45px;
      color: #f40;
      font-weight: bold;
      font-size: 15px;
      right: 10px;
    }
    .number {
      position: absolute;
      right: 10px;
      bottom: 10px;
      input {
        height: 28px;
        line-height: 28px;
      }
    }
  }

  .el-input-number--small {
    width: 160px;
  }
}
</style>
