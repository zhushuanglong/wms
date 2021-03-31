<template>
  <div>
    <el-dialog title="关闭采购单" :visible.sync="dialogFormVisible" width="600px" :before-close="handleClose">
      <el-form ref="closeDataForm" :rules="rules" :model="closeParams" label-position="left" label-width="80px">
        <el-form-item label="采购单ID">{{closeParams.purchaseOrderId}}</el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input 
            type="textarea"
            :rows="4"
            v-model="closeParams.remark" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="handleClose">
          取消
        </el-button>
        <el-button type="primary" @click="colseOrder">
          确定
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import request from '@/api/request'

export default {
  name: 'PurchaseOrderClose',
  props: {
    dialogFormVisible: {
      type: Boolean,
      default: false
    },
    closeParams: {
      type: Object,
      default: {
        purchaseOrderId: '',
        remark: ''
      }
    }
  },
  data() {
    return {
      rules: {
        remark: [{ required: true, message: '备注不能为空', trigger: 'blur' }]
      }
    }
  },
  watch: {},
  methods: {
    // 关闭订单
    colseOrder() {
      this.$refs['closeDataForm'].validate((valid) => {
        if (valid) {
          request({
            url: '/closePurchaseOrder',
            method: 'post',
            params: this.closeParams
          }).then(res => {
            this.$message({
              type: 'success',
              message: '采购单关闭成功！'
            })
            this.$emit('update:dialogFormVisible', false) // 关闭弹层
            this.$emit('getList') // 刷新列表
          })  
        }
      })
    },
    // 取消
    handleClose() {
      this.$emit('update:dialogFormVisible', false)
    }
  }
}
</script>
