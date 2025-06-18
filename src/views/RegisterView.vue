<template>
  <div class="register-container">
    <div class="register-header">
      <van-nav-bar
        title="注册"
        left-arrow
        @click-left="onClickLeft"
      />
    </div>
    
    <div class="register-form">
      <van-form @submit="onSubmit">
        <van-cell-group inset>
          <van-field
            v-model="username"
            name="username"
            label="用户名"
            placeholder="请输入用户名"
            :rules="usernameRules"
            class="custom-field"
          />
          <van-field
            v-model="phone"
            name="phone"
            label="手机号"
            placeholder="请输入手机号"
            :rules="phoneRules"
            class="custom-field"
          />
          <van-field
            v-model="password"
            type="password"
            name="password"
            label="密码"
            placeholder="请输入密码"
            :rules="passwordRules"
            class="custom-field"
          />
          <van-field
            v-model="confirmPassword"
            type="password"
            name="confirmPassword"
            label="确认密码"
            placeholder="请再次输入密码"
            :rules="confirmPasswordRules"
            class="custom-field"
          />
          <div class="gender-field">
            <span class="gender-label">性别</span>
            <van-radio-group v-model="gender" direction="horizontal">
              <van-radio name="male">男</van-radio>
              <van-radio name="female">女</van-radio>
              <van-radio name="unknown">未知</van-radio>
            </van-radio-group>
          </div>
        </van-cell-group>
        
        <div style="margin: 16px;">
          <van-button round block type="primary" native-type="submit">
            注册
          </van-button>
        </div>
      </van-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { showSuccessToast, showFailToast } from 'vant';
import axios from 'axios';
import Mock from 'mockjs';

const router = useRouter();
const username = ref('');
const phone = ref('');
const password = ref('');
const confirmPassword = ref('');
const gender = ref('unknown');

// 用户名验证规则
const usernameRules = [
  { required: true, message: '请填写用户名' },
  { validator: validateUsername, message: '用户名长度为3-20个字符' },
  { validator: checkUsernameExist, message: '该用户名已被注册' }
];

// 手机号验证规则
const phoneRules = [
  { required: true, message: '请填写手机号' },
  { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码' }
];

// 密码验证规则
const passwordRules = [
  { required: true, message: '请填写密码' },
  { validator: validatePassword, message: '密码长度为6-20个字符，需包含字母和数字' }
];

// 确认密码验证规则
const confirmPasswordRules = [
  { required: true, message: '请确认密码' }, 
  { validator: validateConfirmPassword, message: '两次密码不一致' }
];

// 模拟检查用户名是否存在
Mock.mock('/api/user/check-username', 'post', (options) => {
  const { username } = JSON.parse(options.body);
  // 模拟已存在的用户名
  const existingUsernames = ['admin', 'test', 'user123'];
  return {
    code: existingUsernames.includes(username) ? 400 : 200,
    message: existingUsernames.includes(username) ? '用户名已存在' : '用户名可用'
  };
});

// 验证用户名长度
function validateUsername(val) {
  return val.length >= 1 && val.length <= 10;
}

// 检查用户名是否已存在
async function checkUsernameExist(val) {
  if (val.length < 1) return true; // 长度不够时不检查
  
  try {
    const res = await axios.post('/api/user/check-username', { username: val });
    return res.data.code === 200;
  } catch (error) {
    console.error('检查用户名失败', error);
    return true; // 出错时默认通过
  }
}

// 验证密码复杂度
function validatePassword(val) {
  // 密码长度6-20，必须包含字母和数字
  const hasLetter = /[a-zA-Z]/.test(val);
  const hasNumber = /\d/.test(val);
  return val.length >= 6 && val.length <= 20 && hasLetter && hasNumber;
}

// 验证确认密码
function validateConfirmPassword() {
  return password.value === confirmPassword.value;
}

const onClickLeft = () => {
  router.back();
};

const onSubmit = async (values) => {
  try {
    // 这里可以添加额外的验证逻辑
    if (!validatePassword(values.password)) {
      showFailToast('密码格式不正确');
      return;
    }
    
    // 模拟注册请求
    Mock.mock('/api/user/register', 'post', () => {
      // 获取已注册用户列表
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      
      // 检查用户名是否已存在
      const userExists = registeredUsers.some(user => user.username === values.username);
      if (userExists) {
        return {
          code: 400,
          message: '该用户名已被注册'
        };
      }
      
      // 添加新用户到列表
      registeredUsers.push({
        username: values.username,
        password: values.password,
        phone: values.phone,
        gender: values.gender
      });
      
      // 保存到localStorage
      localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
      
      return {
        code: 200,
        message: '注册成功'
      };
    });
    
    const res = await axios.post('/api/user/register', values);
    if (res.data.code === 200) {
      showSuccessToast('注册成功，请登录');
      router.push('/login');
    } else {
      showFailToast(res.data.message || '注册失败');
    }
  } catch (error) {
    console.error('注册失败', error);
    showFailToast('注册失败，请重试');
  }
};
</script>

<style scoped>
.register-container {
  height: 100vh;
  background-color: #f7f8fa;
}

.register-form {
  padding: 20px 0;
}

.gender-field {
  display: flex;
  align-items: center;
  padding: 10px 16px;
}

.gender-label {
  margin-right: 20px;
  min-width: 90px;
  font-size: 14px;
}

/* 添加自定义输入框样式 */
.custom-field :deep(input) {
  caret-color: transparent; /* 默认隐藏光标 */
}

.custom-field :deep(input:focus) {
  caret-color: #1989fa; /* 获得焦点时显示光标，颜色与Vant主题色一致 */
}
</style>