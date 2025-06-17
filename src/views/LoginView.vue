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
          />
          <van-field
            v-model="password"
            type="password"
            name="password"
            label="密码"
            placeholder="请输入密码"
            :rules="[{ required: true, message: '请填写密码' }]"
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

const router = useRouter();
const username = ref('');
const password = ref('');

const onClickLeft = () => {
  router.back();
};

const onSubmit = (values) => {
  // 模拟登录成功
  if (values.username && values.password) {
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
    showFailToast('登录失败，请检查用户名和密码');
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
</style>