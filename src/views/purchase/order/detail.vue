<template>
  <div class="app-container">
    <!-- 基本信息 -->
    <div class="global-list-info">
      <div class="info-header">
        <div>基本信息</div>
        <div>
          <router-link :to="{ path: '/store', query: { id: list.purchaseOrderId } }" class="mr10">
            <el-button type="primary" size="mini">
              去库存页
            </el-button>
          </router-link>
          <el-button v-if="list.purchaseOrderStatus !== 'COMPLETE'" type="danger" size="mini" @click="handleClose">
            关闭
          </el-button>
        </div>
      </div>
      <div class="info-main">
        <ul class="ul-info-main">
          <li>
            <span>采购单ID：</span>
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
      <el-table-column label="SKUCODE" align="center" width="150px">
        <template slot-scope="{row}">
          <span>{{ row.skuCode }}</span>
        </template>
      </el-table-column>

      <el-table-column label="图片" width="120px" align="center">
        <template slot-scope="{row}">
          <span>
            <img :src="row.skuPics" width="100px" />
          </span>
        </template>
      </el-table-column>

      <el-table-column label="标题" min-width="200px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.skuTitle }}</span>
        </template>
      </el-table-column>

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

      <el-table-column label="采购量" width="100px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.quantity }}</span>
        </template>
      </el-table-column>

      <el-table-column label="状态" width="200px" align="center">
        <template slot-scope="{row}">
          <span>{{ statusMap[row.purchaseOrderLineStatus] }} （{{ row.inboundQuantity }} / {{ row.quantity }}）</span>
        </template>
      </el-table-column>
    </el-table>

    <!-- 返修退货弹层 -->
    <el-dialog title="返修退货" :visible.sync="returnDialogFormVisible" width="1280px">
      <el-form ref="returnDialogForm" style="max-height: 600px; overflow-y: scroll;">
        <el-table
          ref="multipleTable"
          :data="purchaseOrderLinesList"
          tooltip-effect="dark"
          border
          style="width: 100%;"
          @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="40"></el-table-column>

          <el-table-column label="SKUCODE" align="center" width="150px">
            <template slot-scope="{row}">
              <span>{{ row.skuCode }}</span>
            </template>
          </el-table-column>

          <el-table-column label="图片" width="120px" align="center">
            <template slot-scope="{row}">
              <span>
                <img :src="row.skuPics" width="100px" />
              </span>
            </template>
          </el-table-column>

          <el-table-column label="标题" min-width="200px" align="center">
            <template slot-scope="{row}">
              <span>{{ row.skuTitle }}</span>
            </template>
          </el-table-column>

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

          <el-table-column label="备注" width="200px" align="center">
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
  </div>
</template>

<script>
import request from '@/api/request'
// eslint-disable-next-line
import { parseTime } from '@/utils'
import CloseDialog from './components/closeDialog'

export default {
  name: 'PurchaseOrderDetail',
  components: { CloseDialog },
  data() {
    return {
      tableHead: [],
      tableData:[],
      list: {}, // 采购单详情数据
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
      // 关闭采购单参数
      closeParams: {
        purchaseOrderId: '',
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
        url: '/queryPurchaseOrders',
        method: 'get',
        params: {
          purchaseOrderId: this.$route.query.id
        }
      }).then(res => {
        const { purchaseOrders } = res.data
        this.list = purchaseOrders[0]
        this.purchaseOrderLinesList = purchaseOrders[0].purchaseOrderLines
        this.listLoading = false
        // console.log(this.purchaseOrderLinesList)
        this.rearrangementData()
      })
    },

    // 表格数据重排
    rearrangementData() {
      let arrangementList = this.purchaseOrderLinesList
      let len = this.purchaseOrderLinesList.length
      let tableHead = [
        {
          columnKey: 'name',
          columnLable: '姓名'
        },
        {
          columnKey: 'sex',
          columnLable: '性别'
        }
      ]

      // let tableData = [
      //   {
      //     name: '啦啦',
      //     sex: '女'
      //   }
      // ]

      // SKU属性是个数组，平铺展示
      for (let i = 0; i < len; i++) {
        let skuPropValues = arrangementList[i].skuPropValues
        let sLen = skuPropValues.length
        for (let j = 0; j < sLen; j++) {
          arrangementList[i]['skuPropValuesLabel' + j ] = skuPropValues[j].categoryPropDefName
          arrangementList[i]['skuPropValuesValue' + j ] = skuPropValues[j].categoryPropValue
        }
      }

      // for (let k = 0; k < arrangementList.length; k++) {
      //   tableHead.push({
      //     columnKey: arrangementList
      //     columnLable,
      //   })
      // }

      console.log(arrangementList)

      // <!-- <template v-for="(item,index) in tableHead">
      //   <el-table-column :prop="item.columnKey" :label="item.columnLabel" :key="index" v-if="item.columnKey != 'id'"></el-table-column>
      // </template> -->
    },
    
    // 导出EXCEL
    handleExportExcel(row, $index) {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['采购单号', '主麦', '商品SKU', '图片', '单价', '尺码', '采购数量', '采购总数', '供货商名称', '结算方式']
        const filterVal = ['skuCode', 'skuCode', 'skuCode', 'skuPics', 'purchasePrice', 'skuCode', 'quantity', 'quantity', 'skuCode', 'skuCode']
        const list = this.purchaseOrderLinesList
        const data = this.formatJson(filterVal, list)

        // const merges = ['A1:A2', 'B1:D1', 'E1:E2'] // 多级组合
        // excel.export_json_to_excel({
        //   header: tHeader,
        //   // merges,
        //   data,
        //   filename: '采购单' // 文件名
        //   // autoWidth: true, // 宽度
        //   // bookType: 'xlsx' // 类型
        // })
        console.log(data)
        this.downloadLoading = false
      })
    },
    formatJson(filterVal, jsonData) {
      console.log(jsonData)
      return jsonData.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
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
