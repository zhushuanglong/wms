<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input 
        v-model="listQuery.productId" 
        class="filter-item mr10"
        placeholder="产品代码"
        style="width: 200px;"
        clearable
        @keyup.enter.native="handleFilter"
      />
      <el-input 
        v-model="listQuery.title" 
        class="filter-item mr10"
        placeholder="产品标题"
        style="width: 200px;"
        clearable
        @keyup.enter.native="handleFilter"
      />

      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-plus" @click="handleCreate">
        上新
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-shopping-cart-2" @click="handleAddCart">
        批量加入采购车
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="success" icon="el-icon-document" @click="handleCreate">
        批量导出
      </el-button>
    </div>

    <el-table
      ref="multipleTable"
      v-loading="listLoading"
      :data="list"
      border
      style="width: 100%;"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="50px" align="center"></el-table-column>

      <el-table-column label="产品编码" width="150px" align="center">
        <template slot-scope="{row}">
          <span class="incart-icon" v-show="row.inCart"><i class="el-icon-shopping-cart-full"/></span>
          <span>{{ row.productCode }}</span>
        </template>
      </el-table-column>

      <el-table-column label="图片" width="100px" align="center">
        <template slot-scope="{row}">
          <span v-if="row.productPics">
            <!-- 取一个 -->
            <img :src="row.productPics[0]" width="75px" style="vertical-align: middle;"/>
          </span>
        </template>
      </el-table-column>

      <el-table-column label="产品标题" prop="productTitle" min-width="200px" align="center"></el-table-column>
      <el-table-column label="类目属性" prop="categoryName" min-width="200px" align="center"></el-table-column>

      <el-table-column label="创建时间" width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.creationTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>

      <el-table-column label="更新时间" width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.updateTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" min-width="200" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="handleView(row)">
            详情
          </el-button>
          <el-button v-if="row.status!='deleted'" size="mini" type="danger" @click="handleRemove(row,$index)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <Pagination v-show="total>0" :total="total" :page.sync="listQuery.pageNo" :limit.sync="listQuery.pageSize" @pagination="getList" />

  </div>
</template>

<script>
import request from '@/api/request'
// eslint-disable-next-line
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import { setTimeout } from 'timers';

export default {
  name: 'ManagementProduct',
  components: {
    Pagination
  },
  data() {
    return {
      list: null, // 列表数据
      total: 0,
      listLoading: true,
      listQuery: {
        pageNo: 1,
        pageSize: 20,
        productId: '',
        title: '',
        withAllFields: true // 所有字段
      },
      selectedData: [], // 选中的数据
      downloadLoading: false
    }
  },
  created() {
    let that = this
    this.getList()
  },
  
  methods: {
    getList() {
      this.listLoading = true

      request({
        url: '/queryProducts',
        method: 'get',
        params: { ...this.listQuery }
      }).then(res => {
        const { products, total } = res.data
        this.list = products
        this.total = total
        this.listLoading = false

        this.toggleCartData()
      })
    },
    
    // 选中表格
    handleSelectionChange(val) {
      this.selectedData = val
    },
    // 根据localStorage数据 
    // 返选table表
    toggleCartData() {
      // 根据购物车信息，选中或取消选中产品
      const FOBJ = JSON.parse(localStorage.getItem('WMS-Cart-Obj'))
      let checkedObj = {}
      if (FOBJ) {
        this.list.map((v, index) => {
          v.skus.map(v2 => {
            if (FOBJ[v2.skuId] === 1 && !checkedObj['line' + index]) {
              checkedObj['line' + index] = true
              this.toggleSelection([this.list[index]])
              v.inCart = true
            }
          })
        })
      }
    },
    // 主动 - 选表格
    toggleSelection(rows) {
      if (rows) {
        setTimeout(() => {
          rows.forEach(row => {
            this.$refs.multipleTable.toggleRowSelection(row)
          })
        }, 200)
      } else {
        this.$refs.multipleTable.clearSelection(row)
      }
    },

    handleFilter() {
      this.listQuery.pageNo = 1
      this.getList()
    },

    // 创建
    handleCreate() {
      this.$router.push({ path: '/product/create' })
    },
    // 加入购物车
    handleAddCart() {
      if (!this.selectedData.length) return this.$message({type: 'error', message: '产品不能为空，请勾选产品!'})

      try {
        const FOBJ = JSON.parse(localStorage.getItem('WMS-Cart-Obj'))
        let cartObj = {
          cartData: []
        }

        if (FOBJ !== null) {
          cartObj = FOBJ
        }

        // 数据处理
        this.selectedData.map((v, index) => {
          v.skus.map(v2 => {
            if (cartObj[v2.skuId] !== 1) {
              cartObj.cartData.push({
                ...v2
              })
              cartObj[v2.skuId] = 1 // 记录sku信息，用于去重
              // 在表格内提示 已加入采购车
            }
          })
          this.list.map(v3 => {
            if (v.productId === v3.productId) {
              this.$set(v3, 'inCart', true)
            }
          })
        })

        // 数据存储
        this.$addStorageEvent(1, 'WMS-Cart-Obj', JSON.stringify(cartObj))
      } catch(e) {}
    },
    // 详情
    handleView(row) {
      this.$router.push({ path: '/product/view', query: { id: row.productId } })
    },
    removeData(row) {
      request({
        url: '/removeProduct',
        method: 'post',
        params: {
          productId: row.productId
        }
      }).then(res => {
        this.getList()
      })
    },
    // 删除产品
    handleRemove(row, index) {
      this.$confirm('确认删除该产品吗?', '警告', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          await this.removeData(row)
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
        }).catch(() => {
          this.$message({
            type: 'error',
            message: '删除失败!'
          })
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.incart-icon {
  position: absolute;
  left: -35px;
  top: 30px;
  z-index: 5;
  font-size: 16px;
  color: orangered;
}
</style>
