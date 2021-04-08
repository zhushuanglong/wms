<template>
  <div class="app-container">
    <div style="display: flex; margin-bottom: 20px">
      <!-- 基本信息 -->
      <div class="global-list-info" style="width: 50%; margin-right: 20px;">
        <div class="info-header">
          <div>基本信息</div>
          <div>
            <el-button type="primary" size="mini" @click="handleInbound">入库</el-button>
            <el-button v-if="list.purchaseOrderStatus !== 'COMPLETE'" type="danger" size="mini" @click="handleClose">关闭</el-button>
          </div>
        </div>
        <div class="info-main">
          <ul class="ul-info-main">
            <li>
              <span>采购单号：</span>
              <span>{{ list.purchaseOrderId }}</span>
            </li>
            <li>
              <span>供应商名称：</span>
              <span>{{ list.supplierName }}</span>
            </li>
            <li>
              <span>采购总数：</span>
              <span>{{ list.quantity }}</span>
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
              <span>状态：</span>
              <span>{{ statusMap[list.purchaseOrderStatus] }} （{{ list.inboundQuantity }} / {{ list.quantity }}）</span>
            </li>
            <li>
              <span>备注：</span>
              <span>{{ list.remark }}</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- 操作记录 -->
      <div class="global-list-info" style="width: 50%;">
        <div class="info-header">
          <div>操作记录</div>
        </div>
        <el-table
          :data="boundList"
          v-loading="listLoading"
          height="300px"
          style="width: 100%;"
        >
          <el-table-column label="货架" prop="canonicalShelfCode" align="center"></el-table-column>
          <el-table-column label="SKUID" prop="skuId" align="center"></el-table-column>
          <el-table-column label="数量" prop="amount" align="center"></el-table-column>
          <el-table-column label="操作人" prop="operatorName" align="center"></el-table-column>
          <el-table-column label="操作时间" width="150" align="center">
            <template slot-scope="{row}">
              <span>{{ row.opTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
            </template>
          </el-table-column>

          <el-table-column label="操作类型" align="center" class-name="small-padding fixed-width">
            <template slot-scope="{row,$index}">
              <span>{{ opMap[row.op] }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- 详情信息 -->
    <div class="global-list-info" style="border-bottom: 0; margin-top: 20px;">
      <div class="info-header" style="border-bottom: 0;">
        <div>详情信息</div>
        <div>
          <el-button type="primary" size="mini" @click="returnDialogFormVisible = true">
            返修退货
          </el-button>
          <el-button type="success" size="mini" @click="handleExportExcel">
            导出EXCEL
          </el-button>
        </div>
      </div>
    </div>
    <el-table
      v-loading="listLoading"
      :data="purchaseOrderLinesList"
      border
      fit
      style="width: 100%;"
    >
      <el-table-column label="SKU编码" prop="skuCode" align="center" width="150px"></el-table-column>

      <el-table-column label="图片" width="120px" align="center">
        <template slot-scope="{row}">
          <span>
            <img :src="row.skuPics" width="75px" />
          </span>
        </template>
      </el-table-column>

      <el-table-column label="标题" prop="skuTitle" min-width="200px" align="center"></el-table-column>

      <el-table-column label="SKU属性" min-width="150px" align="center">
        <template slot-scope="{row}">
          <p v-for="item in row.skuPropValues">
            {{ item.categoryPropDefName }}：{{ item.categoryPropValue }}
          </p>
        </template>
      </el-table-column>

      <el-table-column label="采购价" width="100px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.purchasePrice }}</span>
        </template>
      </el-table-column>

      <el-table-column label="采购量" prop="quantity" width="100px" align="center"></el-table-column>

      <el-table-column label="状态" width="200px" align="center">
        <template slot-scope="{row}">
          <span>{{ statusMap[row.purchaseOrderLineStatus] }} （{{ row.inboundQuantity }} / {{ row.quantity }}）</span>
        </template>
      </el-table-column>
    </el-table>

    <!-- 返修退货弹层 -->
    <el-dialog title="返修退货" :visible.sync="returnDialogFormVisible" width="1280px">
      <el-form ref="returnDialogForm" >
        <el-table
          :data="purchaseOrderLinesList"
          tooltip-effect="dark"
          border
          height="600"
          style="width: 100%;"
          @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="40"></el-table-column>

          <el-table-column label="SKU编码" prop="skuCode" align="center" width="150px"></el-table-column>

          <el-table-column label="图片" width="120px" align="center">
            <template slot-scope="{row}">
              <span>
                <img :src="row.skuPics" width="75px" />
              </span>
            </template>
          </el-table-column>

          <el-table-column label="标题" prop="skuTitle" width="150px" align="center"></el-table-column>

          <el-table-column label="SKU信息" width="150px" align="center">
            <template slot-scope="{row}">
              <p v-for="item in row.skuPropValues">
                {{ item.categoryPropDefName }}：{{ item.categoryPropValue }}
              </p>
            </template>
          </el-table-column>

          <el-table-column label="采购价" width="100px" align="center">
            <template slot-scope="{row}">
              <span>{{ row.purchasePrice }}</span>
            </template>
          </el-table-column>

          <el-table-column label="状态" width="150px" align="center">
            <template slot-scope="{row}">
              <span>{{ statusMap[row.purchaseOrderLineStatus] }} （{{ row.inboundQuantity }} / {{ row.quantity }}）</span>
            </template>
          </el-table-column>

          <el-table-column label="退货数" width="100px" align="center">
            <template slot-scope="{row}">
              <el-input v-model="row.returnQuantity" placeholder="退货数" />
            </template>
          </el-table-column>

          <el-table-column label="备注" min-width="200px" align="center" class-name="small-padding fixed-width">
            <template slot-scope="{row}">
              <el-input v-model="row.remark" type="textarea"  placeholder="* 退货备注" />
            </template>
          </el-table-column>

        </el-table>
      </el-form>
      
      <div slot="footer" class="dialog-footer">
        <el-button @click="returnDialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="handleReturnDialogForm">
          确定
        </el-button>
      </div>
    </el-dialog>

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
import CloseDialog from './components/closeDialog'
import InboundDialog from './components/inboundDialog'

export default {
  name: 'PurchaseOrderDetail',
  components: { CloseDialog, InboundDialog },
  data() {
    return {
      tableHead: [],
      tableData:[],
      list: {}, // 采购单详情数据
      boundList: [], // 出入库记录
      purchaseOrderLinesList: [], // sku列表
      returnSelectionData: [], // 返修退货数据
      listLoading: true,
      statusMap: {
        'NOT_ARRIVED': '待到货',
        'PARTIAL_ARRIVED': '部分到货',
        'COMPLETE': '已完成'
      },
      // 返修退货 - 弹层
      returnDialogFormVisible: false,
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
        url: '/queryPurchaseOrders',
        method: 'get',
        params: {
          purchaseOrderId: this.$route.query.id,
          withOpRecords: true, // 是否附带查出操作纪录 Default: false
          withPurchaseOrderLines: true // 是否附带采购单条目 Default: false
        }
      }).then(res => {
        const { data } = res

        if (data) {
          const { purchaseOrders } = data
          this.list = purchaseOrders[0] || {}
          this.purchaseOrderLinesList = this.list.purchaseOrderLines
          this.boundList = this.list.opRecords
          this.listLoading = false
        }
      })
    },
    
    // 导出EXCEL
    handleExportExcel(row, $index) {},

    // 入库
    handleInbound() {
      this.inboundDialogFormVisible = true
      this.inboundParams.purchaseOrderId = this.list.purchaseOrderId
    },
    // 关闭
    handleClose(row, index) {
      this.dialogFormVisible = true
      this.closeParams.purchaseOrderId = this.list.purchaseOrderId
    },

    // 退货数据
    handleSelectionChange(val) {
      this.returnSelectionData = val
    },
    // 提交-返修退货
    handleReturnDialogForm() {
      let rData = this.returnSelectionData
      let len = rData.length
      let returnLines = []

      // 提交数据重组合
      for (let i = 0; i < len; i++) {
        if (rData[i].returnQuantity !== '') {
          returnLines.push({
            purchaseOrderLineId: rData[i].purchaseOrderLineId,
            quantity: rData[i].returnQuantity,
            remark: rData[i].remark || ''
          })
        }
      }

      // 数据提交
      if (returnLines.length) {
        request({
          url: '/returnPurchaseOrder',
          method: 'post',
          params: {
            returnLines
          }
        }).then(res => {
          this.$message({
            type: 'success',
            message: '提交返修退货成功！'
          })
          this.returnDialogFormVisible = false
        })
      } else {
        this.returnDialogFormVisible = false
      }
    }
  }
}
</script>

<style lang="scss">

</style>
