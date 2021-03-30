<template>
  <div class="app-container">
    <div class="filter-container">
      <!-- <el-input 
        v-model="listQuery.name" 
        placeholder="供应商名称" 
        style="width: 200px;" 
        class="filter-item" 
        @keyup.enter.native="handleFilter" /> -->

      <el-autocomplete
        v-model="listQuery.name"
        class="inline-input filter-item"
        :fetch-suggestions="querySearch"
        placeholder="请输入供应商名称"
        style="width: 200px;"
      />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        添加
      </el-button>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column label="ID" prop="id" align="center" width="80">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>

      <el-table-column label="供应商名称" width="400px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.name }}</span>
        </template>
      </el-table-column>

      <el-table-column label="创建时间" width="200px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.createTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>

      <el-table-column label="更新时间" width="200px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.updateTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" min-width="200" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button v-if="row.status!='deleted'" size="mini" type="danger" @click="handleDelete(row,$index)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" /> -->

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="100px" style="width: 400px; margin-left:50px;">
        <el-form-item label="供应商名称" prop="name">
          <el-input v-model="temp.name" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          确定
        </el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import request from '@/api/request'
import waves from '@/directive/waves' // waves directive 防重
// eslint-disable-next-line
import { parseTime } from '@/utils'
// import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  name: 'ComplexTable',
  components: { 
    // Pagination 
  },
  directives: { waves },
  data() {
    return {
      tableKey: 0,
      list: null, // 列表数据
      total: 0,
      listLoading: true,
      listQuery: {
        // page: 1,
        // limit: 20,
        name: '' // 供应商名称
      },
      dialogFormVisible: false,
      dialogStatus: '',
      // 弹层
      textMap: {
        update: '编辑',
        create: '添加'
      },
      temp: {},
      rules: {
        name: [{ required: true, message: '请填写供应商名称', trigger: 'blur' }]
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
        url: '/supplier/list',
        method: 'get',
        params: this.listQuery
      }).then(res => {
        const { list, total } = res.data
        this.list = list
        this.total = total
        this.listLoading = false
      })
    },
    querySearch(queryString, cb) {
      const suppliers = this.list
      var results = queryString ? suppliers.filter(this.createFilter(queryString)) : suppliers
      // 调用 callback 返回建议列表的数据
      console.log(queryString, this.createFilter(queryString), 222)
      cb(results)
    },
    createFilter(queryString) {
      return (arr) => {
        return (
          arr.name.toLowerCase().indexOf(queryString.toLowerCase()) === 0
        )
      }
    },
    handleFilter() {
      // this.listQuery.page = 1
      this.getList()
    },
    createData() {
      this.handleCreateUpdateData('create', '添加')
    },
    handleCreate() {
      this.temp = {}
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.handleCreateUpdateData('edit', '编辑')
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleCreateUpdateData(api, desc) {
      const tempData = Object.assign({}, this.temp)
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          request({
            url: '/supplier/' + api,
            method: 'get',
            params: tempData
          }).then(res => {
            this.$notify({
              title: '成功',
              message: desc + '成功',
              type: 'success',
              duration: 2000
            })
            
            this.dialogFormVisible = false
            this.getList()
          })
        }
      })
    },
    handleDelete(row, index) {
      this.$notify({
        // title: '成功',
        message: '删除成功',
        type: 'success',
        duration: 2000
      })
      this.getList()
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
