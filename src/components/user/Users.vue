<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!-- 搜索、添加 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList()">
            <el-button slot="append" icon="el-icon-search" @click="getUserList()"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible=true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表展示 -->
      <el-table :data="userlist" border style="width: 100%">
        <el-table-column type="index" label="编号" width="60px"></el-table-column>
        <el-table-column prop="username" label="姓名" width="180"></el-table-column>
        <el-table-column prop="email" label="邮箱" width="180"></el-table-column>
        <el-table-column prop="mobile" label="电话" width="180"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.mg_state"
              active-color="#13ce66"
              @change="userStateChange(scope.row)"
            ></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.id)"
            ></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeUser(scope.row.id)"
            ></el-button>
            <el-tooltip
              class="item"
              effect="dark"
              content="角色分配"
              placement="top"
              :enterable="false"
             
            >
              <el-button type="warning" icon="el-icon-setting" size="mini"  @click="setRole(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页功能 -->
      <el-pagination
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-size="queryInfo.pagesize"
        layout="total, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 添加用户对话框 -->

    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="clearForm">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="80px">
        <el-form-item label="名称" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑用户对话框 -->

    <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%" @close="editDialogClose">
      <!-- 内容 -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配权限 -->
    <el-dialog title="分配权限" :visible.sync="setDialogVisible" width="50%" @close="setDialogClose">
     <div>
         <p>当前的用户：{{this.userInfo.username}}</p>
         <p>当前的权限：{{this.userInfo.role_name}}</p>
         <p>请选择权限：
            <el-select v-model="selectedRoleId" placeholder="请选择">
    <el-option
      v-for="item in rolesList"
      :key="item.id"
      :label="item.roleName"
      :value="item.id">
    </el-option>
  </el-select>
           </p> 

       </div>
     <span slot="footer" class="dialog-footer">
        <el-button @click="setDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    const checkEmail = (rule, value, cb) => {
      const regemail = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
      if (regemail.test(value)) return cb()
      cb(new Error('请输入合法的邮箱'))
    }
    //验证手机号
    const checkMobile = (rule, value, cb) => {
      const regtel = /^1[3-9][0-9]{9}$/
      if (regtel.test(value)) return cb()
      cb(new Error('请输入合法的手机号码'))
    }
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 2
      },
      userlist: [],
      total: 0,
      //添加用户
      addDialogVisible: false,
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名称', trigger: 'blur' },
          { min: 2, max: 8, message: '长度在 2 到 8 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入用户密码', trigger: 'blur' },
          { min: 6, max: 18, message: '长度在 6 到 18 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入用户邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入用户手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      //编辑用户
      editDialogVisible: false,
      editForm: {},
      //编辑用户验证
      editFormRules: {
        email: [
          { required: true, message: '请输入用户邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入用户手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      setDialogVisible:false,
      //所有角色信息
      rolesList:[],
      //需要分配的用户
      userInfo:{},
      selectedRoleId:''
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    async getUserList() {
      const { data: res } = await this.$http.get('users', {
        params: this.queryInfo
      })
      // console.log(res);
      if (res.meta.status != 200) return this.$message.error(res.meta.msg)
      this.userlist = res.data.users
      this.total = res.data.total
      // console.log(this.userlist)
    },
    handleCurrentChange(newPage) {
      // console.log(pagenum);
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    async userStateChange(userInfo) {
      // console.log(userInfo)
      const { data: res } = await this.$http.put(
        `users/${userInfo.id}/state/${userInfo.mg_state}`
      )
      // console.log(res);
      if (res.meta.status != 200) {
        userInfo.mg_state = !userInfo.mg_state
        return this.$message.error(res.meta.msg)
      }
      this.$message.success(`更新用户状态成功`)
    },
    //添加用户
    addUser() {
      this.$refs.addFormRef.validate(async valid => {
        // console.log(valid);
        if (!valid) return this.$message.error('添加失败')
        const { data: res } = await this.$http.post('users', this.addForm)
        // console.log(res)

        if (res.meta.status != 201) {
          return this.$message.error('添加用户失败')
        }
        this.$message.success(`添加用户状态成功`)
        this.getUserList()
        this.addDialogVisible = false
      })
    },
    clearForm() {
      this.$refs.addFormRef.resetFields()
    },

    //编辑用户
    editDialogClose() {
      this.$refs.editFormRef.resetFields()
    },
    async showEditDialog(id) {
      // console.log(id)
      this.editDialogVisible = true
      const { data: res } = await this.$http.get('users/' + id)
      if (res.meta.status !== 200) return this.$message.error('查询用户失败')
      // this.$message.success(`查询用户状态成功`)
      this.editForm = res.data
    },
    //提交编辑
    editUser() {
      this.$refs.editFormRef.validate(async valid => {
        // console.log(valid);
        if (!valid) return this.$message.error('更新失败')
        const { data: res } = await this.$http.put(
          'users/' + this.editForm.id,
          {
            email: this.editForm.email,
            mobile: this.editForm.mobile
          }
        )

        if (res.meta.status != 200) {
          return this.$message.error('更新用户失败')
        }
        this.getUserList()
        this.$message.success(`更新用户状态成功`)
        this.editDialogVisible = false
      })
    },
    //删除用户
    async removeUser(id) {
      const result = await this.$confirm(
        '此操作将永久删除该用户, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      // console.log(result)
      if (result !== 'confirm') return this.$message.info('取消删除')
      //   const {data:res}= await this.$http.delete('users/'+id)
      //   if(res.meta.status!=200)  return this.$message.error('删除用户失败')
      //  this.$message.success('删除用户成功')
      //  this.getUserList()
      fetch('http://127.0.0.1:8888/api/private/v1/users/'+id, { 
        method: 'delete',
        headers: {
          Authorization: window.sessionStorage.getItem('token')
        }
        })
        .then(function(data) {
          return data.text()
        })
        .then(function(res) {
          // console.log(res)
          //   if(res.meta.status!=200)  return 
      //  this.$message.success('删除用户成功')
       this.getUserList()
        })
    },
    //点击分配权限按钮，获取数据
   async setRole(userInfo){
     this.userInfo=userInfo
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status != 200) return this.$message.error(res.meta.msg)
      this.rolesList = res.data
      console.log(this.rolesList);
      
      this.setDialogVisible=true
    },
    //点击保存分配角色权限
   async saveRole(){
     if(!this.selectedRoleId) return this.$message.error('请选择角色')
      const { data: res } = await this.$http.put(`users/${this.userInfo.id}/role`,{
        rid:this.selectedRoleId
      })
      if (res.meta.status != 200) return this.$message.error(res.meta.msg)
     this.$message.success("分配权限成功")
      this.getUserList()
      
      this.setDialogVisible=false
    },
    //关闭分配角色窗口
    setDialogClose(){
      this.selectedRoleId = ''
      this.userInfo = {}
    }
  }
}
</script>
<style lang="less" scoped>
.el-breadcrumb {
  font-size: 12px;
}
.el-card {
  margin-top: 20px;
}
</style>