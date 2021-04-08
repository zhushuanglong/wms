<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input 
        v-model="listQuery.orderId" 
        class="filter-item mr10"
        placeholder="订单号"
        style="width: 200px;"
        clearable
        @keyup.enter.native="handleFilter"
      />

      <el-input 
        v-model="listQuery.shopOrderId" 
        class="filter-item mr10"
        placeholder="店铺订单号"
        style="width: 200px;"
        clearable
        @keyup.enter.native="handleFilter"
      />
      
      <el-select 
        v-model="listQuery.orderStatus"  
        class="filter-item mr10" 
        filterable 
        placeholder="订单状态"
        clearable
      >
        <el-option label="开启" value="OPEN"/>
        <el-option label="关闭" value="CLOSED"/>
      </el-select>

      <el-select 
        v-model="listQuery.logisticsStatus"  
        class="filter-item mr10" 
        filterable 
        placeholder="物流状态"
        clearable
      >
        <el-option label="陆运" value="UNSHIPPED"/>
        <el-option label="海运" value="SHIPPED"/>
      </el-select>

      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">搜索</el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="success" icon="el-icon-document" >批量导出</el-button>
    </div>

    <el-table
      v-loading="listLoading"
      :data="list"
      border
      style="width: 100%;"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="40px"></el-table-column>
      <el-table-column label="订单号" prop="orderId" width="150px" align="center"></el-table-column>
      <el-table-column label="收货人" prop="consigneeName" width="100px" align="center"></el-table-column>
      <el-table-column label="收货人手机" prop="consigneeMobile" width="100px" align="center"></el-table-column>
      <el-table-column label="收货人邮件" prop="consigneeEmail" width="150px" align="center"></el-table-column>
      <el-table-column label="创建时间" width="150px" align="center">
        <template slot-scope="{row}">
          <p>{{ row.creationTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</p>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" width="150px" align="center">
        <template slot-scope="{row}">
          <p>{{ row.updateTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</p>
        </template>
      </el-table-column>
      <el-table-column label="订单状态" width="100px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.logisticsStatus === 'OPEN' ? '打开': '关闭' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="物流状态" width="100px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.logisticsStatus === 'UNSHIPPED' ? '陆运': '海运' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="金额" width="100px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.actualFee }}</span>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" min-width="200" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="handleView(row.orderId)">详情</el-button>
          <el-button type="primary" size="mini" @click="handleOpRecords(row)">出库记录</el-button>
        </template>
      </el-table-column>
    </el-table>

    <Pagination v-show="total>0" :total="total" :page.sync="listQuery.pageNo" :limit.sync="listQuery.pageSize" @pagination="getList" />

    <el-dialog title="出库记录" :visible.sync="dialogFormVisible" width="800px">
      <el-table
        :data="rowList"
        border
        style="width: 100%;"
      >
        <el-table-column label="货架" prop="canonicalShelfCode" width="150px" align="center"></el-table-column>
        <el-table-column label="SKU号" prop="skuId" width="150px" align="center"></el-table-column>
        <el-table-column label="数量" prop="amount" width="100px" align="center"></el-table-column>
        <el-table-column label="操作人" prop="operatorName" width="100px" align="center"></el-table-column>
        <el-table-column label="操作时间" min-width="150px" align="center">
          <template slot-scope="{row}">
            <span>{{ row.opTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
          </template>
        </el-table-column>

        <el-table-column label="操作类型" align="center" width="100" class-name="small-padding fixed-width">
          <template slot-scope="{row,$index}">
            <span>{{ opMap[row.op] }}</span>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

  </div>
</template>

<script>
import request from '@/api/request'
// eslint-disable-next-line
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  name: 'IndexOrder',
  components: {
    Pagination
  },
  data() {
    return {
      dialogFormVisible: false,
      list: null, // 列表数据
      rowList: null, 
      total: 0,
      listLoading: true,
      listQuery: {
        pageNo: 1,
        pageSize: 20,
        orderId: '', // 订单ID
        shopOrderId: '', // 店铺订单ID 如shopify的
        orderStatus: '', // 订单状态
        logisticsStatus: '', // 物流状态
        withOpRecords: true // 是否查询物流状态
      },
      selectedData: [], // 选中的数据
      downloadLoading: false,

      opMap: {
        INBOUND: '入库',
        OUTBOUND: '出库',
        INVENTORY_CORRECTION: '校正'
      }
    }
  },
  created() {
    this.getList()
  },
  
  methods: {
    getList() {
      this.listLoading = true

      request({
        url: '/queryOrders',
        method: 'get',
        params: { ...this.listQuery }
      }).then(res => {
        const { orders, total } = res.data
        this.list = orders
        this.total = total
        this.listLoading = false
      })
    },
    
    handleFilter() {
      this.listQuery.pageNo = 1
      this.getList()
    },

    // 选中表格
    handleSelectionChange(val) {
      this.selectedData = val
      console.log(val)
    },

    // 查看
    handleView(orderId) {
      this.$router.push({ path: '/order/detail', query: {id: orderId} })
    },

    // 出库记录表
    handleOpRecords(row) {
      this.rowList = row.opRecords
      this.dialogFormVisible = true
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
