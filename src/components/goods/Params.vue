<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>参数管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-alert title="只显示第三级权限" type="warning" show-icon></el-alert>
      <el-row>
        <span>选择商品分类：</span>
        <el-cascader
          v-model="selectedKeys"
          :options="catelist"
          :props="cateProps"
          @change="selectCateChange"
          class="parentForm"
          :clearable="true"
        ></el-cascader>
      </el-row>
      <!-- tab栏 -->
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" :disabled="isDisabled" @click="addDialogVisible=true">添加参数</el-button>
          <el-table :data="manyTableData" border stripe>
            <el-table-column type="expand"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" size="mini" @click="showEditDialog(scope.row.attr_id)">修改</el-button>
                <el-button type="danger" size="mini" @click="removeParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态参数" name="only" :disabled="isDisabled">
          <el-button type="primary" @click="addDialogVisible=true">添加属性</el-button>
          <el-table :data="onlyTableData" border stripe>
            <el-table-column type="expand"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" size="mini" @click="showEditDialog(scope.row.attr_id)">修改</el-button>
                <el-button type="danger" size="mini" @click="removeParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加参数对话框 -->
    <el-dialog
      :title="'添加'+titleText"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClose"
    >
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改参数对话框 -->

    <el-dialog
      :title="'修改'+titleText"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClose"
    >
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      catelist: [],
      cateProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      selectedKeys: [],
      activeName: 'many',
      manyTableData: [],
      onlyTableData: [],
      //添加表单区域
      addDialogVisible: false,
      addForm: {},
      addFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' },
          { min: 2, max: 5, message: '长度在 2 到 5 个字符', trigger: 'blur' }
        ]
      },
      //修改参数对话框
      editDialogVisible: false,
      editForm: {},
      editFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' },
          { min: 2, max: 5, message: '长度在 2 到 5 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200)
        return this.$message.error('获取父级分类失败')
      //   console.log(res.data);
      this.catelist = res.data
      //   console.log(this.catelist);
    },
    //级联选择器
    selectCateChange() {
      //   console.log(this.selectedKeys)
      this.getParamsData()
    },
    handleClick() {
      this.getParamsData()
    },
    async getParamsData() {
      if (this.selectedKeys.length !== 3) {
        this.selectedKeys = []
        return
      }
      console.log(this.cateId)
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        {
          params: { sel: this.activeName }
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数列表失败')
      }
      //   console.log(res)
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    // 关闭添加参数窗口
    addDialogClose() {
      this.$refs.addFormRef.resetFields()
      this.addDialogVisible = false
    },
    addParams() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          }
        )
        if (res.meta.status !== 201) return
        this.$message.success('添加成功')
        this.getParamsData()
        this.addDialogVisible = false
      })
    },
    //修改参数
    async showEditDialog(attr_id) {
      //   console.log(this.cateId)

      //查询当前参数的信息
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes/${attr_id}`,
        {
          params: { attr_sel: this.activeName }
        }
      )
      if (res.meta.status !== 200) return this.$message.error('获取参数失败')
      this.editForm = res.data
      //   console.log(this.editForm)

      this.editDialogVisible = true
    },
    editDialogClose() {
      this.editDialogVisible = false
    },
    editParams() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
          {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName
          }
        )
        if (res.meta.status !== 200) return this.$message.error('修改失败')
        this.$message.success('修改成功')
        this.getParamsData()
        this.editDialogVisible = false
      })
    },
    //删除参数
    async removeParams(attr_id) {
      // console.log(attr_id);

      const result = await this.$confirm(
        '此操作将永久删除参数, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (result !== 'confirm') {
        return this.$message.info('取消删除')
      }
      //删除
      const { data: res } = await this.$http.delete(
        `categories/${this.cateId}/attributes/${attr_id}`
      )
    //   console.log(res)

      if (res.meta.status !== 200) return this.$message.error('删除失败')
      this.$message.success('删除成功')
      this.getParamsData()
    }
  },
  computed: {
    isDisabled() {
      if (this.selectedKeys.length !== 3) {
        return true
      }
      return false
    },
    cateId() {
      return this.isDisabled
        ? null
        : this.selectedKeys[this.selectedKeys.length - 1]
    },
    titleText() {
      if (this.activeName == 'many') {
        return '动态参数'
      }
      return '静态属性'
    }
  }
}
</script>
<style lang="less" scoped>
.el-row {
  margin: 15px 0;
  span {
    font-size: 14px;
  }
}
</style>