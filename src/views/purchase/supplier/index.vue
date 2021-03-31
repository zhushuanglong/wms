<template>
  <div class="app-container">
    <div class="filter-container">
      <el-select 
        v-model="listQuery.supplierId"  
        class="filter-item mr10" 
        filterable 
        placeholder="请选择供应商"
        clearable
      >
        <el-option
          v-for="item in list"
          :key="item.supplierId"
          :label="item.supplierName"
          :value="item.supplierId"
        />
      </el-select>

      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-plus" @click="handleCreate">
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
      <el-table-column label="供应商ID" prop="id" align="center" width="80">
        <template slot-scope="{row}">
          <span>{{ row.supplierId }}</span>
        </template>
      </el-table-column>

      <el-table-column label="供应商名称" width="300px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.supplierName }}</span>
        </template>
      </el-table-column>

      <el-table-column label="创建时间" width="200px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.creationTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>

      <el-table-column label="更新时间" width="200px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.updateTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>

      <el-table-column label="备注" width="200px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.remark }}</span>
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

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="600px">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="100px">
        <el-form-item label="供应商名称" prop="supplierName">
          <el-input v-model="temp.supplierName" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="temp.remark" type="textarea" placeholder="请输入，如 URL 等备注" />
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
// eslint-disable-next-line
import { parseTime } from '@/utils'
// import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  name: 'PurchaseSupplier',
  components: {},
  data() {
    return {
      tableKey: 0,
      list: null, // 列表数据
      total: 0,
      listLoading: true,
      listQuery: {
        // page: 1,
        // limit: 20,
        supplierId: ''
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
        supplierName: [{ required: true, message: '请填写供应商名称', trigger: 'blur' }]
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
        url: '/querySuppliers',
        method: 'get',
        params: {
          supplierId: this.listQuery.supplierId
        }
      }).then(res => {
        const { suppliers, total } = res.data
        this.list = suppliers
        this.total = total
        this.listLoading = false
        // this.getQuerySearchList()
      })
    },
    
    // 数据处理
    // getQuerySearchList() {
    //   this.list.map(arr => {
    //     arr.value = arr.supplierName
    //   })
    // },
    // querySearch(queryString, cb) {
    //   const results = queryString 
    //     ? this.list.filter(arr => arr.value.toLowerCase().indexOf(queryString.toLowerCase()) >= 0) 
    //     : this.list
      
    //   cb(results)
    // },
    handleFilter() {
      // this.listQuery.page = 1
      this.getList()
    },
    createData() {
      this.handleCreateUpdateData('/createSupplier', '添加')
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
      this.handleCreateUpdateData('/modifySupplier', '编辑')
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, {
        supplierId: row.supplierId,
        supplierName: row.supplierName,
        remark: row.remark
      })
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
            url: api,
            method: 'post',
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
    deleteData(row) {
      request({
        url: '/removeSupplier',
        method: 'post',
        params: {
          supplierId: row.supplierId
        }
      }).then(res => {
        this.getList()
      })
    },
    handleDelete(row, index) {
      this.$confirm('确认删除供应商?', '警告', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          await this.deleteData(row)
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
        })
        .catch(err => { console.error(err) })
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
