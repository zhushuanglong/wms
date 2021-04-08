<template>
  <div class="app-container">
    <el-tabs v-model="activeTabName" class="purchase-tabs" @tab-click="handleTabClick">
      <el-tab-pane label="全部" name="">全部</el-tab-pane>
      <el-tab-pane label="待到货" name="NOT_ARRIVED">待到货</el-tab-pane>
      <el-tab-pane label="部分到货" name="PARTIAL_ARRIVED">部分到货</el-tab-pane>
      <el-tab-pane label="已完成" name="COMPLETE">已完成</el-tab-pane>
    </el-tabs>

    <div class="filter-container">
      <el-select 
        v-model="listQuery.supplierId"  
        class="filter-item mr10" 
        filterable 
        placeholder="供应商"
        clearable
      >
        <el-option
          v-for="item in supplierList"
          :key="item.supplierId"
          :label="item.supplierName"
          :value="item.supplierId"
        />
      </el-select>

      <el-input 
        v-model="listQuery.purchaseOrderId" 
        class="filter-item mr10"
        placeholder="扫码内容"
        style="width: 200px;"
        clearable
        @keyup.enter.native="handleFilter"
      />
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">搜索</el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-plus" @click="handleCreate">创建采购单</el-button>
    </div>

    <el-table
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column label="采购单号" prop="purchaseOrderId" align="center" width="200"></el-table-column>
      <el-table-column label="供应商名称" prop="supplierName" width="150px" align="center"></el-table-column>
      <el-table-column label="采购总数" prop="quantity" width="100px" align="center"> </el-table-column>
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
      <el-table-column label="状态" width="200px" align="center">
        <template slot-scope="{row}">
          <span>{{ statusMap[row.purchaseOrderStatus] }} （{{ row.inboundQuantity }} / {{ row.quantity }}）</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" prop="remark" width="150px" align="center"></el-table-column>
      <el-table-column label="操作" align="center" min-width="200" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <router-link :to="{ path: '/purchase/detail', query: { id: row.purchaseOrderId } }" class="mr10">
            <el-button type="primary" size="mini">详情</el-button>
          </router-link>
          <el-button type="primary" size="mini" @click="handleInbound(row)">入库</el-button>
          <el-button type="success" size="mini" @click="handleExportExcel(row, $index)">导出EXCEL</el-button>
          <el-button v-if="row.status!='deleted'" size="mini" type="danger" @click="handleClose(row,$index)">关闭</el-button>
        </template>
      </el-table-column>
    </el-table>

    <Pagination v-show="total>0" :total="total" :page.sync="listQuery.pageNo" :limit.sync="listQuery.pageSize" @pagination="getList" />

    <CloseDialog 
      :dialogFormVisible.sync="dialogFormVisible" 
      :closeParams="closeParams" 
      @getList="getList"
    />

    <InboundDialog 
      :dialogFormVisible.sync="inboundDialogFormVisible"
      :inboundParams="inboundParams" 
      @callback="getList"
    />
  </div>
</template>

<script>
import request from '@/api/request'
// eslint-disable-next-line
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination'
import CloseDialog from './components/closeDialog'
import InboundDialog from './components/inboundDialog'

export default {
  name: 'PurchaseOrder',
  components: { 
    Pagination,
    CloseDialog,
    InboundDialog
  },
  data() {
    return {
      activeTabName: '',
      list: null, // 采购单数据
      supplierList: null, // 供应商数据
      total: 0,
      listLoading: true,
      listQuery: {
        pageNo: 1,
        pageSize: 20,
        supplierId: '', // 供应商ID
        purchaseOrderId: '', // 扫码扫出来的采购单ID
        purchaseOrderStatus: '' // 空是全部  NOT_ARRIVED待到货  PARTIAL_ARRIVED部分到货  COMPLETE已完成
      },
      
      // 状态MAP
      statusMap: {
        'NOT_ARRIVED': '待到货',
        'PARTIAL_ARRIVED': '部分到货',
        'COMPLETE': '已完成'
      },
      // 关闭 - 弹层
      dialogFormVisible: false,
      // 入库 - 弹层
      inboundDialogFormVisible: false,
      // 关闭采购单参数
      closeParams: {
        purchaseOrderId: '',
        remark: ''
      },
      // 入库参数
      inboundParams: {
        purchaseOrderId: '', // 采购单ID
        binItemsText: '' // 货位项文本（扫码枪所得
      },
      rules: {
        remark: [{ required: true, message: '备注不能为空', trigger: 'blur' }]
      },
      downloadLoading: false
    }
  },
  created() {
    this.getList()
    this.getSupplierList()
  },
  
  methods: {
    getList() {
      this.listLoading = true

      request({
        url: '/queryPurchaseOrders',
        method: 'get',
        params: this.listQuery
      }).then(res => {
        const { purchaseOrders, total } = res.data
        this.list = purchaseOrders
        this.total = total
        this.listLoading = false
      })
    },
    getSupplierList() {
      request({
        url: '/querySuppliers',
        method: 'get',
        params: {}
      }).then(res => {
        const { suppliers } = res.data
        this.supplierList = suppliers
      })
    },
    handleFilter() {
      this.listQuery.pageNo = 1
      this.getList()
    },
    // 导出EXCEL
    handleExportExcel(row, $index) {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['采购单号', '主麦', '商品SKU', '图片', '单价', '尺码', '采购数量', '采购总数', '供货商名称', '结算方式']
        const filterVal = ['id', 'title', 'author', 'pageviews', 'display_time']
        const list = this.list[$index]
        // console.log(list)
        // debugger
        const data = this.formatJson(filterVal, list)
        const merges = ['A1:A2', 'B1:D1', 'E1:E2'] // 多级组合
        excel.export_json_to_excel({
          header: tHeader,
          merges,
          data,
          filename: '采购单' // 文件名
          // autoWidth: true, // 宽度
          // bookType: 'xlsx' // 类型
        })
        this.downloadLoading = false
      })
    },
    // 创建采购单
    handleCreate() {
      this.$router.push({ path:'/product/index' })
    },
    // 关闭订单
    handleClose(row, index) {
      this.dialogFormVisible = true
      this.closeParams.purchaseOrderId = row.purchaseOrderId
    },
    handleInbound(row) {
      this.inboundDialogFormVisible = true
      this.inboundParams.purchaseOrderId = row.purchaseOrderId
    },
    // 点击tab
    handleTabClick({ name }) {
      this.listQuery = {
        pageNo: 1,
        pageSize: this.listQuery.pageSize,
        supplierId: '', // 供应商ID
        purchaseOrderId: '', // 扫码扫出来的采购单ID
        purchaseOrderStatus: name || '' // 空是全部  NOT_ARRIVED待到货  PARTIAL_ARRIVED部分到货  COMPLETE已完成
      }
      this.getList()
    }
  }
}
</script>

<style lang="scss">
.purchase-tabs .el-tabs__content {
  display: none;
}
</style>
