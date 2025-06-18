<template>
  <div class="login-container">
    <div class="login-header">
      <van-nav-bar
        title="登录"
        left-arrow
        @click-left="onClickLeft"
      />
    </div>
    
    <div class="login-form">
      <van-form @submit="onSubmit">
        <van-cell-group inset>
          <van-field
            v-model="username"
            name="username"
            label="用户名"
            placeholder="请输入用户名"
            :rules="[{ required: true, message: '请填写用户名' }]"
            class="custom-field"
          />
          <van-field
            v-model="password"
            type="password"
            name="password"
            label="密码"
            placeholder="请输入密码"
            :rules="[{ required: true, message: '请填写密码' }]"
            class="custom-field"
          />
        </van-cell-group>
        
        <div style="margin: 16px;">
          <van-button round block type="primary" native-type="submit">
            登录
          </van-button>
        </div>
      </van-form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { showSuccessToast, showFailToast } from 'vant';
import axios from 'axios';
import Mock from 'mockjs';

const router = useRouter();
const username = ref('');
const password = ref('');

// 模拟已注册用户数据库
Mock.mock('/api/user/check-login', 'post', (options) => {
  const { username, password } = JSON.parse(options.body);
  
  // 从localStorage获取已注册用户列表
  const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
  
  // 检查用户是否存在
  const userExists = registeredUsers.some(user => 
    user.username === username && user.password === password
  );
  
  return {
    code: userExists ? 200 : 400,
    message: userExists ? '登录成功' : '用户名或密码错误，或该用户未注册'
  };
});

const onClickLeft = () => {
  router.back();
};

const onSubmit = async (values) => {
  try {
    // 调用登录验证接口
    const res = await axios.post('/api/user/check-login', {
      username: values.username,
      password: values.password
    });
    
    if (res.data.code === 200) {
      // 登录成功
      // 检查localStorage中是否已有该用户的信息
      const storedUserInfoStr = localStorage.getItem('userInfo');
      let userInfo;
      
      if (storedUserInfoStr) {
        // 如果已有用户信息，使用已有信息，只更新用户名
        userInfo = JSON.parse(storedUserInfoStr);
        userInfo.nickname = values.username;
      } else {
        // 如果没有用户信息，创建新的用户信息
        userInfo = {
          id: 1,
          nickname: values.username,
          avatar: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
          signature: '这是我的个性签名',
        };
      }
      
      // 保存到本地存储
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
      localStorage.setItem('isLoggedIn', 'true');
      
      showSuccessToast('登录成功');
      router.push('/profile');
    } else {
      // 登录失败
      showFailToast(res.data.message || '登录失败');
    }
  } catch (error) {
    console.error('登录失败', error);
    showFailToast('登录失败，请重试');
  }
};
</script>

<style scoped>
.login-container {
  height: 100vh;
  background-color: #f7f8fa;
}

.login-form {
  padding: 20px 0;
}

/* 添加自定义输入框样式 */
.custom-field :deep(input) {
  caret-color: transparent; /* 默认隐藏光标 */
}

.custom-field :deep(input:focus) {
  caret-color: #1989fa; /* 获得焦点时显示光标，颜色与Vant主题色一致 */
}
</style>