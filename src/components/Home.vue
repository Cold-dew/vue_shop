<template>
  <el-container>
    <el-header>
      <div>
        <img src="../assets/1.jpg" alt />
        <span>电商后台管理系统</span>
      </div>
      <el-button type="danger" @click="logout">退出</el-button>
    </el-header>
    <el-container>
      <el-aside :width="isCollapse?'64px':'200px'">
        <div class="toggle-button" @click="toggleCollapse">
          <i class="el-icon-more"></i>
        </div>

        <el-menu
          background-color="#545c64"
          text-color="#fff"
          active-text-color="blue"
          :collapse="isCollapse"
          unique-opened
          :collapse-transition="false"
          router
          :default-active="activePath"
        >
          <el-submenu :index="``+item.id" v-for="item in menulist" :key="item.id">
            <!-- 一级菜单 -->
            <template slot="title">
              <i :class="icons[item.id]"></i>
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item
              :index="`/`+subItem.path"
              v-for="subItem in item.children"
              @click="savePath(`/`+subItem.path)"
            >
              <i class="el-icon-menu"></i>
              {{subItem.authName}}
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>
<script>
export default {
  data() {
    return {
      menulist: [],
      icons: {
        '125': 'el-icon-user-solid',
        '103': 'el-icon-s-tools',
        '101': 'el-icon-goods',
        '102': 'el-icon-tickets',
        '145': 'el-icon-s-data'
      },
      isCollapse: false,
      activePath: ''
    }
  },
  methods: {
    logout() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    async getMenuList() {
      //   fetch('http://127.0.0.1:8888/api/private/v1/menus')
      //     .then(function(res) {
      //         console.log(res);

      //     //   return res.text()
      //       return res.json()
      //     })
      //     .then(function(data) {
      //       //   在这个then里面我们能拿到最终的数据

      //       console.log(data)
      //     })
      const { data: res } = await this.$http.get('menus')
      //  console.log(res);
      if (res.meta.status != 200) return this.$message.error(res.meta.msg)
      //   console.log(res.data)

      this.menulist = res.data
    },
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    },
    savePath(activePath) {
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    }
  },
  created() {
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  }
}
</script>
<style lang="less" scoped>
.el-container {
  height: 100%;
  .el-header {
    background-color: rgb(197, 255, 192);
    display: flex;
    justify-content: space-between;

    align-items: center;
    img {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      vertical-align: middle;
    }
    span {
      margin-left: 10px;
      color: #fff;
      font-size: 16px;
    }
  }
  .el-aside {
    background-color: #545c64;
    .el-menu {
      border: 0;
    }
    i {
      color: #fff;
    }
  }
  .el-main {
    background-color: #eaedf1;
  }
  .toggle-button {
    height: 26px;
    background-color: #4a5064;
    font-size: 14px;
    line-height: 26px;
    color: #fff;
    text-align: center;
    letter-spacing: 0.2em;
    cursor: pointer;
  }
}
</style>