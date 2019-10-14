<template>
  <div class="login_container">
    <div class="login_box">
      <div class="user_box">
        <img src="../assets/logo.png" alt />
      </div>
      <el-form
        :model="form"
        ref="loginFormRef"
        :rules="formRules"
        label-width="0px"
        class="login_from"
      >
        <el-form-item prop="username">
          <el-input v-model="form.username" prefix-icon="el-icon-user-solid"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" prefix-icon="el-icon-lock"></el-input>
        </el-form-item>
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import { log } from 'util'
import { async } from 'q'
export default {
  data() {
    return {
      form: {
        username: 'admin',
        password: '123456'
      },
      formRules: {
        username: [
          { required: true, message: '请输入用户昵称', trigger: 'blur' },
          { min: 2, max: 8, message: '长度在 2 到 8 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入用户密码', trigger: 'blur' },
          { min: 6, max: 16, message: '长度在 6 到 16 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    resetForm() {
      this.$refs.loginFormRef.resetFields()
    },
    login() {
      this.$refs.loginFormRef.validate(async valid => {
        if (!valid) return
        let { data: res } = await this.$http.post('login', this.form)
        if (res.meta.status != 200) return this.$message.error('登录失败')
        this.$message.success('登录成功')
        //保存登录成功的token值  保存到sessionStorage中
        window.sessionStorage.setItem('token', res.data.token)
        //登录成功后跳转到home首页
        this.$router.push('/home')
      })
    }
  }
}
</script>

<style lang="less" scoped>
.login_container {
  background-color: #a1cdee;
  height: 100%;
}
.login_box {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 450px;
  height: 300px;
  border-radius: 5px;
  background-color: #fff;
  transform: translate(-50%, -50%);
}
.user_box {
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 130px;
  height: 130px;
  padding: 10px;
  border: 1px solid #eee;
  background-color: #fff;
  border-radius: 50%;
  box-shadow: 0, 0, 10px, #ddd;
  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: #ccc;
  }
}
.login_from {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;

  .btns {
    display: flex;
    justify-content: flex-end;
  }
}
</style>