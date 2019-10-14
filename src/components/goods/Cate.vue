<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="addGoods">添加商品</el-button>
        </el-col>
      </el-row>

      <!-- 表格区域 -->
      <tree-table
        :data="catelist"
        :columns="columns"
        show-index
        index-text="#"
        :show-row-hover="false"
        :selection-type="false"
        :expand-type="false"
        border
        class="tree-table"
      >
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success" style="color:green" v-if="scope.row.cat_deleted==false"></i>
          <i class="el-icon-error" style="color:red" v-else></i>
        </template>

        <template slot="order" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level==0" size="mini">一级</el-tag>
          <el-tag type="success" v-else-if="scope.row.cat_level==1" size="mini">二级</el-tag>
          <el-tag type="warning" v-else size="mini">三级</el-tag>
        </template>

        <template slot="opt" slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
        </template>
      </tree-table>
      <!-- 分页 -->
      <el-pagination
        @current-change="handleCurrentChange"
        :current-page="queryinfo.pagenum"
        :page-size="queryinfo.pagesize"
        layout="total,  prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 添加分类窗口 -->

    <el-dialog title="添加分类" :visible.sync="addDialogVisible" width="50%" @close="addDialogClose">
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="addCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>

        <!-- 三级联动对话框 -->
        <el-form-item label="父级分类：">
             <el-cascader
    v-model="selectedKeys"
    :options="parentCatelist"
    :props="props"
    @change="parentCateChange"  class="parentForm" :clearable="true"></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      queryinfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      catelist: [],
      total: 0,
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          //当前列为模板列
          type: 'template',
          //模板名称
          template: 'isok'
        },
        {
          label: '排序',
          //当前列为模板列
          type: 'template',
          //模板名称
          template: 'order'
        },
        {
          label: '操作',
          //当前列为模板列
          type: 'template',
          //模板名称
          template: 'opt'
        }
      ],
      addDialogVisible: false,
      addCateForm: {
        cat_name: '',
        cat_pid: '',
        cat_level: 0
      },
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
          { min: 2, max: 5, message: '长度在 2 到 5 个字符', trigger: 'blur' }
        ]
      },
      selectedKeys:[],
      parentCatelist:[],
      props:{expandTrigger: 'hover',
          value:'cat_id',
          label:'cat_name',
          children:'children',
          checkStrictly:true,
          }
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: this.queryinfo
      })
      // console.log(res.data);
      this.catelist = res.data.result
      this.total = res.data.total
      // console.log(this.total);
    },
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', {
        type:2
      })
      if(res.meta.status!==200) return this.$message.error("获取父级分类失败")
    //   console.log(res.data);
      this.parentCatelist = res.data
    //   console.log(this.parentCatelist);
      
      // console.log(this.total);
    },
    handleCurrentChange(newPage) {
      this.queryinfo.pagenum = newPage
      this.getCateList()
    },
    addGoods() {
        this.getParentCateList()
      this.addDialogVisible = true
    },
    //关闭窗口，清空数据
    addDialogClose() {
      this.addDialogVisible = false
      this.selectedKeys=[]
      this.addCateForm.cat_level=0
      this.addCateForm.cat_pid0
      this.$refs.addCateFormRef.resetFields()
    },
    //选择父联选择器后，获取cat_pid和cat_level
    parentCateChange(){
        // console.log(this.selectedKeys);
        if(this.selectedKeys.length>0){
            this.addCateForm.cat_pid=this.selectedKeys[this.selectedKeys.length-1]
            this.addCateForm.cat_level=this.selectedKeys.length
        }else{
            this.addCateForm.cat_pid=0
            this.addCateForm.cat_level=0
        }  
    },
    // 点击确定添加商品分类
    addCate(){
        // console.log(this.addCateForm);
        this.$refs.addCateFormRef.validate(async valid=>{
            if(!valid) return
         const {data:res} = await  this.$http.post('categories',this.addCateForm)
        //  if(res.meta.status!==200) return
            this.$message.success("添加分类成功")
            this.getCateList()
            this.addDialogVisible = false
        })
        
    }
  }
}
</script>
<style lang="less" scoped>
.tree-table {
  margin-top: 20px;
}
.parentForm{
    width: 100%;
}
</style>