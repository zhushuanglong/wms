<template>
  <div class="app-container product-create-main">
    <el-form ref="form" :rules="rules" :model="form" label-width="80px">
      <el-form-item label="产品编码">
        <el-input v-model="form.productCode" disabled></el-input>
      </el-form-item>

      <el-form-item label="产品标题">
        <el-input v-model="form.productTitle" disabled></el-input>
      </el-form-item>

      <el-form-item label="产品图片" prop="productPics">
        <el-upload
          action="https://jsonplaceholder.typicode.com/posts/"
          list-type="picture-card"
          :on-success="handleAvatarSuccess"
          :on-preview="handlePictureCardPreview"
          :on-remove="handleRemove">
          <i class="el-icon-plus"></i>
        </el-upload>
        <el-dialog :visible.sync="dialogVisible">
          <img width="100%" :src="dialogImageUrl" />
        </el-dialog>  
      </el-form-item>

      <el-form-item label="产品品类" prop="categoryId">
        <el-cascader
          v-model="categoryValue"
          :options="categoryOptions"
          :props="{ expandTrigger: 'hover' }"
          @change="handleCategoryChange"></el-cascader>
      </el-form-item>

      <!-- 类目属性选择 - Eddie -->
      <el-form-item label="类目属性" prop="nonSkuCategoryProps">
        <div class="categroy-props-layout">
          <ul class="categroy-props-list layout-box">
            <li class="tip" v-if="!renderNonSkuProps.length">请先选择产品品类</li>
            <li v-for="(item, index) in renderNonSkuProps">
              <div class="lable-name">{{ item.localizedName }}</div>
              <div class="lable-value-list">
                <div 
                  class="lable-value" 
                  v-for="(propValueItem, $index) in item.valueDef" 
                  :key="propValueItem.valueKey"
                  :class="{ 'active': choosedNonSkuPropObj[item.propNameKey] && choosedNonSkuPropObj[item.propNameKey].propValueKey === propValueItem.valueKey }"
                  @click="handleChooseNonSkuProps(item.propNameKey, propValueItem, true)">
                  {{ propValueItem.localizedValue }}
                </div>
              </div>
            </li>
          </ul>

          <div class="categroy-props-icon">
            <i class="el-icon-d-arrow-right" />
          </div>
          <!-- 已选择的类目属性 -->
          <div class="categroy-props-choosed-list layout-box">
            <div class="tip" v-if="!form.nonSkuCategoryProps.length">选择左侧类目属性</div>
            <div 
              class="categroy-props-choosed" 
              v-for="item in form.nonSkuCategoryProps"
              :key="item.propValueKey"
              @click="handleChooseNonSkuProps(item.propNameKey, item)">
              {{ item.propValue }}
            </div>
          </div>
        </div>
      </el-form-item>

      <!-- SKU属性选择 -->
      <el-form-item label="SKU属性">
        <div v-if="!form.nonSkuCategoryProps.length" style="color:#caced4">请先选择产品品类和类目属性</div>
        <div class="sku-list" v-show="form.nonSkuCategoryProps.length" v-for="item in renderSkuPropDefs" :key="item.propNameKey">
          <div class="label-name">{{ item.localizedName }}</div>
          <el-checkbox-group v-model="skuCheckList" @change="skuChange">
            <el-checkbox v-for="checkboxItem in item.valueDef" :key="checkboxItem.valueKey" :label="checkboxItem.localizedValue"></el-checkbox>
          </el-checkbox-group>
        </div>
        
        <div class="sku-info" v-show="form.skus.length">
          <!-- 笛卡尔积展开 -->
          <el-table
            v-loading="skuTableLoading"
            :data="form.skus"
            border
            style="width: 100%;"
          >
            <el-table-column prop="skuCode" label="SKU编码" width="150px" align="center"></el-table-column>
            <el-table-column prop="skuTitle" label="标题" min-width="200px" align="center"></el-table-column>

            <el-table-column label="图片" min-width="200px" align="center">
              <template slot-scope="{row}">
                <el-upload
                  action="https://jsonplaceholder.typicode.com/posts/"
                  list-type="picture-card"
                  :on-success="handleAvatarSuccess"
                  :on-preview="handlePictureCardPreview"
                  :on-remove="handleRemove"
                  >
                  <i class="el-icon-plus"></i>
                </el-upload>
                <el-dialog :visible.sync="dialogVisible">
                  <img width="100%" :src="dialogImageUrl" />
                </el-dialog>
              </template>
            </el-table-column>
            
            <el-table-column v-for="(item, index) in skuTableHead" :key="item.propNameKey" :label="item.localizedName" width="100px" align="center">
              <template slot-scope="{row}">
                <span v-if="row.skuPropValues[index] && (row.skuPropValues[index].propNameKey === item.propNameKey)">{{row.skuPropValues[index].localizedValue}}</span>
              </template>
            </el-table-column>

            <el-table-column label="采购价" width="110px" align="center">
              <template slot-scope="{row}">
                <el-input v-model="row.price" style="width:80px"></el-input>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-form-item>

      <el-form-item>
        <el-button :loading="submitButtonLoading" type="primary" @click="onSubmit('form')">立即上新</el-button>
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
      // 图片上传
      dialogImageUrl: '',
      dialogVisible: false,

      // 品类 数据
      categoryValue: [],
      categoryOptions: [],

      // 非SKU属性类目
      renderNonSkuProps: [], // 左边 - 未选择区数据
      choosedNonSkuPropObj: {}, // 右边 - 已选择区数据的去重Obj

      // SKU属性
      renderSkuPropDefs: [],
      skuCheckList: [], // 选中的SKU 如['蓝','红','L']
      
      skuTableHead: [], // SKU表头
      skuHeadObj: {}, // 表头记录器

      skuTableLoading: false,

      // form表单按钮
      submitButtonLoading: false,
      // form表单数据
      form: {
        productCode: '',
        productTitle: '',
        productPics: [],  // 产品图
        categoryId: '', // 分类ID
        nonSkuCategoryProps: [], // 类目属性
        skus: [] // SKU属性
      },

      // 规则
      rules: {
        productPics: [
          { required: false, message: '至少上传一张图片', trigger: 'change' }
        ],
        categoryId: [
          { required: true, message: '请选择产品品类', trigger: 'change' }
        ],
        nonSkuCategoryProps: [
          { required: true, message: '请选择类目属性', trigger: 'change' }
        ]
      }
    }
  },
  created() {
    this.getCategories()
  },
  beforeMount(){},
  methods: {
    // STEP0 获取品类
    getCategories() {
      request({
        url: '/queryCategories',
        method: 'get',
        params: {}
      }).then(res => {
        const { categories } = res.data
        this.handleRecursive(categories, this.categoryOptions)
      })
    },
    // 递归：
    // arrData 数组数据
    // pushData push数组
    handleRecursive(arrData, pushData) {
      arrData.map((v, index) => {
        pushData.push({
          value: v.categoryId, // 记住id
          label: v.categoryName // 显示
        })
        if (v.subCategories.length > 0) {
          this.handleRecursive(v.subCategories, pushData[index].children = [])
        }
      })
    },
    // STEP1 选择品类
    handleCategoryChange(value) {
      // 已选择的类目id 例：["categoryId_1", "categoryId_1_1"]
      this.form.categoryId = value[value.length - 1]
      // STEP2 获取类目属性
      this.getNonSkuCategoryPropDefs()
      // STEP2 获取SKU属性
      this.getSkuPropDefs()
    },
    // STEP2 获取类目属性
    getNonSkuCategoryPropDefs() {
      request({
        url: '/queryNonSkuCategoryPropDefs',
        method: 'get',
        params: {
          categoryId: this.form.categoryId
        }
      }).then(res => {
        const { defs } = res.data
        this.renderNonSkuProps = defs
      })
    },
    // STEP2 选择类目属性 - 支持正选和反选功能
    // propNameKey 类目名key - style风格，下有很多propValueKey
    // propItem 类目{} 包含propValueKey localizedName
    // type 选择的姿势 true 是正选， false反选/取消
    // 略复杂 - 有问题找Eddie
    handleChooseNonSkuProps(propNameKey, propItem, type) {
      // 每个 propNameKey 例（风格：性感、复古风），只能选择一个
      // 去重 - 位置替换，去除原位置数据
      this.$delete(this.choosedNonSkuPropObj, propNameKey)

      // 正选
      if (type) {
        this.choosedNonSkuPropObj[propNameKey] = {
          propNameKey,
          propValueKey: propItem.valueKey,
          propValue: propItem.localizedValue // 提交无用，渲染用
        }
      }

      // 清空已选, 重新渲染
      this.form.nonSkuCategoryProps = []
      for (let key in this.choosedNonSkuPropObj) {
        this.form.nonSkuCategoryProps.push({
          ...this.choosedNonSkuPropObj[key]
        })
      }

      // STEP3 通过品类Id获取产品Code和Title
      if (this.form.nonSkuCategoryProps.length) {
        this.genProductCodeAndTitle()
      } else {
        this.form.productCode = ''
        this.form.productTitle = ''
      }
    },

    // STEP2 获取SKU属性
    getSkuPropDefs() {
      request({
        url: '/querySkuPropDefs',
        method: 'get',
        params: {
          categoryId: this.form.categoryId
        }
      }).then(res => {
        const { defs } = res.data
        // 渲染视图
        this.renderSkuPropDefs = defs
      })
    },
    
    // STEP3 获取产品Code和Title
    genProductCodeAndTitle() {
      request({
        url: '/genProductCodeAndTitle',
        method: 'post',
        params: {
          categoryId: this.form.categoryId,
          nonSkuCategoryProps: this.form.nonSkuCategoryProps
        }
      }).then(res => {
        const { productCode, productTitle } = res.data
        this.form.productCode = productCode
        this.form.productTitle = productTitle
      })
    },

    // STEP3 SKU选择
    skuChange() {
      let skuProps = []
      let obj = {}
      this.skuTableHead = []

      // 选择SKU - 组合数据 - this.skuCheckList 已选SKU属性，如['蓝','L']
      this.renderSkuPropDefs.map(v => {
        v.valueDef.map(v2 => {
          if (this.skuCheckList.includes(v2.localizedValue)) {
            skuProps.push({
              propNameKey: v.propNameKey,
              propValueKey: v2.valueKey
            })

            obj[v.propNameKey] = v.localizedName
          }
        })
      })
      
      // 获取不重复的表头
      for (let key in obj) {
        this.skuTableHead.push({
          propNameKey: key,
          localizedName: obj[key]
        })
      }
      
      // STEP3 发送组合数据接口
      if (skuProps.length) {
        this.expandSkuProps(skuProps)
      } else {
        this.form.skus = []
      }
    },

    // STEP3 发送组合数据接口获取 skuCode 和 title
    expandSkuProps(skuProps) {
      let tableData = []
      this.skuTableLoading = true

      request({
        url: '/expandSkuProps',
        method: 'post',
        params: {
          categoryId: this.form.categoryId,
          productCode: this.form.productCode,
          nonSkuCategoryProps: this.form.nonSkuCategoryProps,
          skuProps
        }
      }).then(res => {
        const { skus } = res.data
        
        // skuTableHead 和 skuTable 数据关系
        skus.map((v, index) => {
          tableData.push({
            skuCode: v.skuCode,
            skuTitle: v.skuTitle,
            skuPropValues: []
          })
          this.skuTableHead.map(v2 => {
            v.skuPropValues.map(v3 => {
              if (v2.propNameKey === v3.propNameKey) {
                tableData[index].skuPropValues.push({
                  propNameKey: v2.propNameKey,
                  localizedValue: v3.categoryPropValue.localizedValue,
                  propValueKey: v3.categoryPropValue.valueKey
                })
              }
            })
          })
        })

        this.form.skus = this.skuTableHead.length ? tableData : []
        this.skuTableLoading = false
      }).catch(() => {
        this.skuTableLoading = false
      })
    },

    // 上传图片成功
    handleAvatarSuccess(res, file) {
      console.log(res, file, URL.createObjectURL(file.raw), 2222)
      // file.url = res.data.url
      // this.form.skus.skuPics = URL.createObjectURL(file.raw)
    },
    handleRemove(file, fileList) {
      // console.log(file, fileList,333)
      this.form.skus.skuPics = fileList
    },
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url
      this.dialogVisible = true
    },

    // 提交
    onSubmit(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.submitButtonLoading = true

          request({
            url: '/createProduct',
            method: 'post',
            params: this.form
          }).then(res => {
            const { productId } = res.data
            if (productId) {
              this.$message({
                type: 'success',
                message: '上新成功!'
              })
              this.$router.push({ path: '/product/view', query: { id: productId} })
            } else {
              this.$message({
                type: 'error',
                message: '上新失败!'
              })
            }
            this.submitButtonLoading = false
          }).catch(() => {
            this.submitButtonLoading = false
          })
        } else {
          console.log('error submit!!');
          return false
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.product-create-main {
  .categroy-props-layout {
    display: flex;
    .layout-box {
      width: 400px;
      padding: 0 10px;
      min-height: 200px;
      border: 1px solid #dfe4ed;
      border-radius: 4px;
      .tip {
        color: #caced4;
      }
    }
    .categroy-props-icon {
      display: flex;
      font-size: 25px;
      align-items: center;
      padding: 0 10px;
      color: #999;
    }

    .categroy-props-list {
      li {
        display: flex;
        padding: 10px 0;
        border-bottom: 1px solid #dfe4ed;
        .lable-name {
          width: 50px;
          font-weight: bold;
          margin-right: 5px;
        }
        .lable-value-list {
          .lable-value {
            display: inline-block;
            background: #FFF;
            padding: 0 10px;
            color: #409eff;
            background: #ecf5ff;
            border: 1px solid #b3d8ff;
            border-radius: 4px;
            margin-right: 5px;
            margin-bottom: 5px;
            cursor: pointer;
            transition: all .4s;
            &:hover,
            &:active,
            &.active {
              color: #FFF;
              background: #409eff;
              border: 1px solid #409eff;
            }
          }
        }
      }
      li:last-child {
        border-bottom: none;
      }
    }
    .categroy-props-choosed-list {
      padding: 10px;
      .categroy-props-choosed {
        display: inline-block;
        background: #FFF;
        padding: 0 10px;
        color: #67c23a;
        background: #f0f9eb;
        border: 1px solid #c2e7b0;
        border-radius: 4px;
        margin: 0 5px 5px 0;
        cursor: pointer;
        transition: all .4s;
        &:hover,
        &:active {
          color: #FFF;
          background: #67c23a;
          border: 1px solid #67c23a;
        }
      }
    }

  }
  .sku-list {
    display: flex;

    .label-name {
      font-weight: bold;
      margin-right: 20px;
    }
    .el-checkbox {
      min-width: 80px;
    }
  }
}
</style>

<style lang="scss">
.sku-info {
  .el-upload,
  .el-upload-list--picture-card .el-upload-list__item {
    width: 60px;
    height: 60px;
    line-height: 60px;
    i {
      font-size: 18px;
    }
  }
  .el-upload-list--picture-card .el-upload-list__item-status-label {
    top: -15px;
  }
  .el-icon-upload-success {
    display: none!important;
  }
}
</style>

