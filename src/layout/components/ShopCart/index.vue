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
      @change="handleChangeSelect"
      clearable
    >
      <el-option
        v-for="item in supplierList"
        :key="item.supplierId"
        :label="item.supplierName"
        :value="item.supplierId"
      />
    </el-select>
    <div class="errMsg" v-if="errorMsg">{{ errorMsg }} </div>

    <div class="purchase-product-layout" style="height: 700px">
      <div class="purchase-product" v-for="item in cartObj.cartData">
        <div class="pic">
          <img :src="item.skuPics && item.skuPics[0]" />
        </div>
        <div class="info">
          <div class="title">{{ item.skuTitle }}</div>
          <div class="sku-des">
            <div class="label" v-for="skuPropsItem in item.skuProps" :key="skuPropsItem.valueKey">
              {{skuPropsItem.localizedName}}：{{skuPropsItem.localizedValue}}
            </div>
          </div>
          <div class="price">SAR {{ item.purchasePrice }}</div>
          <div class="number" v-if="item.quantity">
            <el-input-number v-model="item.quantity" :min="1" :max="99999" label="数量" size="small"></el-input-number>
          </div>
        </div>
        <i class="el-icon-close close" @click="handleRemove(item)"/>
      </div>
    </div>

    <div class="op-remark">
      <el-input
        type="textarea"
        :rows="4"
        placeholder="请输入必要的备注"
        v-model="params.remark"
        resize="none"
        maxlength="500">
      </el-input>
    </div>

    <div class="op-button">
      <el-button type="primary" @click="handleSubmit">确定采购</el-button>
      <el-button @click="handleClear">清空</el-button>
    </div>

  </div>
</template>

<script>
import request from '@/api/request'
import { mapState } from 'vuex'
export default {
  components: {},
  data() {
    return {
      params: {
        supplierId: '',
        purchaseOrderLines: [],
        remark: ''
      },
      cartObj: {
        cartData: []
      },
      errorMsg: ''
    }
  },
  created() {
    this.querySuppliers()
    
    window.addEventListener('setItem', () => {
      let sessionObj = JSON.parse(sessionStorage.getItem('WMS-Cart-Obj')) || {}
      let cartArr = sessionObj.cartData || []
      
      cartArr.map(v => {
        if (this.cartObj[v.skuId] !== 1) {
          this.cartObj.cartData.push({
            ...v,
            quantity: 1
          })
          this.cartObj[v.skuId] = 1
        }
      })
    })
  },
  watch: {},
  computed: {
    ...mapState({
      supplierList: state => state.suppliers.supplierList
    }),
  },
  methods: {
    querySuppliers() {
      // 获取供应商数据
      this.$store.dispatch('suppliers/querySuppliers', {
        supplierId: ''
      })
        .then(() => {})
        .catch(() => {})
    },
    handleChangeSelect() {
      this.errorMsg = ''
      sessionStorage.getItem('WMS-Cart-Obj')
    },
    // 移除数据
    handleRemove(item) {
      let arr = []
      // 支持单个数据移除
      this.$delete(this.cartObj, item.skuId)
      this.cartObj.cartData.map(v => {
        if (v.skuId !== item.skuId) {
          arr.push({
            ...v
          })
        }
      })
      this.cartObj.cartData = arr

      this.$addStorageEvent(2, 'WMS-Cart-Obj', JSON.stringify(this.cartObj))
    },
    handleClear() {
      // 二次确认
      this.$confirm('确定清空采购车吗?', '警告', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.clearData()
        }).catch(() => {})
    },
    clearData() {
      this.cartObj = {
        cartData: []
      }
      sessionStorage.removeItem('WMS-Cart-Obj')
    },
    // 确认 - 采购
    handleSubmit() {
      if (this.params.supplierId === '') {
        this.errorMsg = '请选择供应商'
        return
      } else {
        this.errorMsg = ''
      }
      // 数据过滤 注入到提交的params里
      this.params.purchaseOrderLines = []

      this.cartData.map(v => {
        this.params.purchaseOrderLines.push({
          skuId: v.skuId,
          quantity: v.quantity,
        })
      })
      
      // 二次确认
      this.$confirm('确定采购吗?', '警告', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          await this.cartSubmit()
          this.$message({
            type: 'success',
            message: '采购成功!'
          })
          this.cartData = []
        }).catch(() => {
          this.$message({
            type: 'error',
            message: '采购取消!'
          })
        })
    },
    cartSubmit() {
      request({
        url: '/createPurchaseOrder',
        method: 'post',
        params: this.params
      }).then(res => {
        const { data } = res

        if (data && data.purchaseOrderId) {
          this.clearData()
          this.$message({
            type: 'success',
            message: '采购成功!'
          })
          this.$router.push({ 
            path: '/purchase/detail', 
            query: { id: purchaseOrderId } 
          })
        } else {
          this.$message({
            type: 'error',
            message: '采购失败，请重新采购!'
          })
        }
      })
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
    width: 100%;
    overflow-y: auto;
  }
  .purchase-product {
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

    i.close {
      position: absolute;
      top: 3px;
      right: 3px;
      z-index: 5;
      cursor: pointer;
      display: none;
    }

    &:hover {
      // background-color: #f3f4f5;
      i.close {
        display: block;
      }
    }
  }
  .purchase-product:first-child {
    border-top: 1px dashed #dcdfe6;
  }

  .el-input-number--small {
    width: 150px;
  }

  .op-button {
    width: 100%;
    position: absolute;
    display: flex;
    justify-content: center;
    // align-content: center;
    bottom: 0;
    padding: 10px;
    background: #FFF;
    z-index: 2000;
  }

  .op-remark {
    width: 100%;
    height: 116px;
    background: #FFF;
    padding: 10px;
    position: absolute;
    bottom: 50px;
    z-index: 2000;
    border-top: 1px solid #e0e0e0;
  }
  .errMsg {
    position: absolute;
    top: 97px;
    left: 10px;
    color: red;
    z-index: 2001;
  }
}

.el-select-dropdown {
  z-index: 100000;
}
</style>
