<template>
  <div class="inbound-dialog">
    <el-dialog title="入库" :visible.sync="dialogFormVisible" width="600px" :before-close="handleClose">
      <el-form ref="inboundForm" :rules="rules" :model="inboundParams"  label-position="left" label-width="80px">
        <el-form-item label="采购单号">{{ inboundParams.purchaseOrderId }}</el-form-item>
        <el-form-item label="货位项" prop="binItemsText">
          <el-input v-model="inboundParams.binItemsText" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleInbound">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import request from '@/api/request'

export default {
  name: 'InboundDialog',
  props: {
    dialogFormVisible: {
      type: Boolean,
      default: false
    },
    inboundParams: {
      type: Object,
      default: {
        purchaseOrderId: '', // 采购单ID
        binItemsText: '' // 货位项文本（扫码枪所得
      }
    }
  },
  data() {
    return {
      binItemsText: '', // 货位项文本（扫码枪所得）
      rules: {
        binItemsText: [{ required: true, message: '货位项不能为空', trigger: 'blur' }]
      }
    }
  },
  methods: {
    // 入库
    handleInbound() {
      this.$refs['inboundForm'].validate((valid) => {
        if (valid) {
          request({
            url: '/inbound',
            method: 'post',
            params: { ...this.inboundParams }
          }).then(res => {
            this.$message({
              type: 'success',
              message: '入库成功！'
            })
            this.$emit('update:dialogFormVisible', false) // 关闭弹层
            this.$emit('callback') // 刷新列表
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
