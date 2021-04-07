<template>
  <div class="app-container">
    <!-- 基本信息 -->
    <div class="global-list-info">
      <div class="info-header">
        <div>基本信息</div>
        <div>
          <el-button v-if="list.orderStatus !== 'CLOSED'" type="primary" size="mini" @click="handleOutbound">出库</el-button>
          <el-button v-if="list.orderStatus !== 'CLOSED'" type="danger" size="mini" @click="handleClose">关闭</el-button>
        </div>
      </div>
      <div class="info-main">
        <ul class="ul-info-main">
          <li>
            <span>订单ID：</span>
            <span>{{ list.orderId }}</span>
          </li>
          <li>
            <span>收货人：</span>
            <span>{{ list.consigneeName }}</span>
          </li>
          <li>
            <span>收货人手机：</span>
            <span>{{ list.consigneeMobile }}</span>
          </li>
          <li>
            <span>收货人邮件：</span>
            <span>{{ list.consigneeEmail }}</span>
          </li>
          <li>
            <span>创建时间：</span>
            <span>{{ list.creationTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
          </li>
          <li>
            <span>更新时间：</span>
            <span>{{ list.updateTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
          </li>
          <li>
            <span>订单状态：</span>
            <span>{{ list.logisticsStatus === 'CLOSED' ? '关闭': '打开' }}</span>
          </li>
          <li>
            <span>物流状态：</span>
            <span>{{ list.logisticsStatus === 'UNSHIPPED' ? '未发货': '发货'}}</span>
          </li>
          <li>
            <span>金额：</span>
            <span>{{ list.actualFee }}</span>
          </li>
        </ul>
      </div>
    </div>

    <!-- 详情信息 -->
    <div class="global-list-info" style="border-bottom: 0; margin-top: 20px;">
      <div class="info-header" style="border-bottom: 0;">
        <div>详情信息</div>
        <div>
          <el-button type="success" size="mini" @click="handleExportExcel">
            导出EXCEL
          </el-button>
        </div>
      </div>
    </div>
    <el-table
      v-loading="listLoading"
      :data="orderLinesList"
      border
      style="width: 100%;"
    >
      <el-table-column label="SKU编码" prop="skuCode" align="center"></el-table-column>
      <el-table-column label="标题" prop="skuTitle" align="center"></el-table-column>
      <el-table-column label="数量" prop="amount" align="center"></el-table-column>
      <el-table-column label="更新时间" align="center">
        <template slot-scope="{row}">
          <p>{{ row.creationTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</p>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" align="center">
        <template slot-scope="{row}">
          <p>{{ row.updateTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</p>
        </template>
      </el-table-column>
    </el-table>


    <CloseDialog 
      :dialogFormVisible.sync="dialogFormVisible" 
      :closeParams="closeParams" 
      @getList="getList"
    />

  </div>
</template>

<script>
import request from '@/api/request'
// eslint-disable-next-line
import { parseTime } from '@/utils'
import CloseDialog from './components/closeDialog'

export default {
  name: 'DetailOrder',
  components: { CloseDialog },
  data() {
    return {
      tableHead: [],
      tableData:[],
      list: {}, // 采购单详情数据
      orderLinesList: [], // sku列表
      returnSelectionData: [], // 返修退货数据
      listLoading: true,
      statusMap: {
        'NOT_ARRIVED': '待到货',
        'PARTIAL_ARRIVED': '部分到货',
        'COMPLETE': '已完成'
      },
      // 关闭 - 弹层
      dialogFormVisible: false,
      // 关闭采购单参数
      closeParams: {
        orderId: '',
        remark: ''
      },
      rules: {
        remark: [{ required: true, message: '备注不能为空', trigger: 'blur' }]
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
        url: '/queryOrders',
        method: 'get',
        params: { ...this.listQuery }
      }).then(res => {
        const { data } = res

        if (data) {
          const { orders } = data
          this.list = orders[0]
          this.orderLinesList = orders[0].orderLines
          this.listLoading = false
        }
      })

    },
    
    // 导出EXCEL
    handleExportExcel(row, $index) {
      this.downloadLoading = true
      this.downloadLoading = false
    },

    // 关闭
    handleClose() {
      this.closeParams.orderId = this.list.orderId
      this.dialogFormVisible = true
    },

    // 出库
    handleOutbound() {
      let binItems = []
      this.orderLinesList.map(v => {
        binItems.push({
          skuId: v.skuId,
          inventory: v.amount
        })
      })

      request({
        url: '/outbound',
        method: 'post',
        params: {
          orderId: this.list.orderId,
          binItems
        }
      }).then(res => {
        const { code } = res

        if (code === 0) {
          this.$message({
            type: 'success',
            message: '出库成功！'
          })
          // TODO 跳转到出库页
        }
      })
    }
  }
}
</script>

<style lang="scss">

</style>
