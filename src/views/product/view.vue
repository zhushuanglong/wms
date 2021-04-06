<template>
  <div class="app-container product-main">
    <el-form ref="form" :model="form" label-width="80px">
      <el-form-item label="产品编码">
        {{ form.productCode }}
      </el-form-item>

      <el-form-item label="产品标题">
        {{ form.productTitle }}
      </el-form-item>

      <el-form-item label="产品图片">
        <img v-for="(item, index) in form.productPics" :key="index" :src="item" style="width: 100px;margin: 0 10px 10px 0;"/>
      </el-form-item>

      <el-form-item label="产品品类">
        {{ form.categoryName }}
      </el-form-item>

      <el-form-item label="创建时间">
        {{ form.creationTime }}
      </el-form-item>

      <el-form-item label="更新时间">
        {{ form.updateTime }}
      </el-form-item>

      <!-- SKU属性选择 -->
      <el-form-item label="SKU列表">
        <div class="sku-info">
          <el-table
            :data="form.skus"
            border
            style="width: 100%;"
          >
            <el-table-column prop="skuCode" label="SKU编码" width="150px" align="center"></el-table-column>
            <el-table-column prop="skuTitle" label="标题" min-width="200px" align="center"></el-table-column>
            <el-table-column label="图片" min-width="200px" align="center">
              <template slot-scope="{row}">
                <img v-for="(item, index) in row.skuPics" :key="index" :src="item" style="width: 60px; margin-right:5px;"/>
              </template>
            </el-table-column>

            <el-table-column v-for="(item, index) in form.skuProps" :key="index" :label="item.categoryPropDef.localizedName" width="100px" align="center">
              <span v-if="item.categoryPropValues && item.categoryPropValues[index]">
                {{ item.categoryPropValues[index].localizedValue }}
              </span>
            </el-table-column>
          
            <el-table-column label="采购价" width="110px" align="center">
              <template slot-scope="{row}">
                <span>{{ row.purchasePrice }}</span>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="handleRemove">删除</el-button>
        <el-button>取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import request from '@/api/request'
import { log } from 'util';

export default {
  name: 'CreateProduct',
  components: {},
  data() {
    return {
      form: {
        productCode: '',
        productTitle: '',
        productPics: [],  // 产品图
        skus: [], // SKU属性
        skuProps: [{
          categoryPropDef: {}, 
          categoryPropValues: []
        }]
      },
      productId: this.$route.query.id
    }
  },
  created() {
    this.queryProducts()
  },
  beforeMount(){},
  methods: {
    // STEP0 查产品
    queryProducts() {
      request({
        url: '/queryProducts',
        method: 'get',
        params: {
          productId: this.productId,
          withAllFields: true
        }
      }).then(res => {
        const { products } = res.data
        if (products && products[0]) {
          this.form = { ...products[0] }
        }
      })
    },
    handleRemove(row, index) {
      this.$confirm('确认删除该产品吗?', '警告', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          request({
            url: '/removeProduct',
            method: 'post',
            params: {
              productId: this.productId
            }
          }).then(res => {
            if (res.code === 0) {
              this.$message({
                type: 'success',
                message: '删除成功!'
              })
              this.$router.push({ path: '/product/index' })
            } else {
              this.$message({
                type: 'error',
                message: '删除失败!'
              })
            }
          })
          
        }).catch(() => {})
    }
  }
}
</script>
