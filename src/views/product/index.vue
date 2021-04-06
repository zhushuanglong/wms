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
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-shopping-cart-2" @click="handleCreate">
        加入采购单
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
      @row-click="toggleSelection"
    >
      <el-table-column type="selection" width="40px"></el-table-column>
      <el-table-column label="产品编码" width="150px" align="center">
        <template slot-scope="{row}">
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

      <el-table-column label="标题" min-width="200px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.productTitle }}</span>
        </template>
      </el-table-column>

      <el-table-column label="类目" min-width="200px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.categoryName }}</span>
        </template>
      </el-table-column>

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
            查看
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

export default {
  name: 'ManagementProduct',
  components: {
    Pagination
  },
  data() {
    return {
      // 表格
      list: null, // 列表数据
      total: 0,
      listLoading: true,
      listQuery: {
        pageNo: 1,
        pageSize: 20,
        productId: '',
        title: ''
      },

      // 编辑、查看
      textMap: {
        create: '添加'
      },
      
      downloadLoading: false
    }
  },
  created() {
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
      })
    },
    toggleSelection(row) {
      this.$refs.multipleTable.toggleRowSelection(row)
    },
    handleFilter() {
      this.listQuery.pageNo = 1
      this.getList()
    },
    createData() {
      
    },
    // 创建
    handleCreate() {
      this.$router.push({ path: '/product/create' })
    },
    // 查看
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

</style>
