<template>
  <div class="profile">
    <!-- 顶部标题栏 -->
    <div class="profile-header">
      <h2>我的</h2>
    </div>

    <!-- 未登录状态 -->
    <div v-if="!isLoggedIn" class="not-logged-in">
      <div class="avatar-placeholder">
        <van-icon name="manager-o" size="50" />
      </div>
      <div class="login-info">
        <p>未登录</p>
        <p class="login-tip">请先登录</p>
      </div>
      <div class="login-buttons">
        <van-button type="primary" size="small" @click="goToLogin">登录</van-button>
        <van-button plain type="primary" size="small" @click="goToRegister">注册</van-button>
      </div>
    </div>

    <!-- 已登录状态 -->
    <div v-else class="user-info">
      <div class="user-header">
        <div class="avatar" @click="uploadAvatar">
          <van-image
            round
            width="70px"
            height="70px"
            :src="userInfo.avatar"
            error-icon="photo-o"
          />
          <div class="avatar-edit">编辑</div>
        </div>
        <div class="user-details">
          <div class="nickname" @click="editNickname">
            <span>{{ userInfo.nickname }}</span>
            <van-icon name="edit" size="14" />
          </div>
          <div class="signature" @click="editSignature">
            <span>{{ userInfo.signature || '点击添加个性签名' }}</span>
            <van-icon name="edit" size="14" />
          </div>
        </div>
        <van-button class="logout-btn" size="small" @click="logout">退出登录</van-button>
      </div>

      <!-- 用户功能区 -->
      <div class="user-functions">
        <van-cell-group inset>
          <van-cell title="我的订单" is-link @click="goToOrders" icon="orders-o" />
          <van-cell title="收货地址" is-link @click="goToAddress" icon="location-o" />
        </van-cell-group>
      </div>
    </div>

    <!-- 编辑昵称弹窗 -->
    <van-dialog
      v-model:show="showNicknameDialog"
      title="修改昵称"
      show-cancel-button
      @confirm="saveNickname"
    >
      <van-field
        v-model="editingNickname"
        placeholder="请输入昵称"
        :error-message="nicknameError"
      />
    </van-dialog>

    <!-- 编辑个性签名弹窗 -->
    <van-dialog
      v-model:show="showSignatureDialog"
      title="修改个性签名"
      show-cancel-button
      @confirm="saveSignature"
    >
      <van-field
        v-model="editingSignature"
        type="textarea"
        placeholder="请输入个性签名"
        rows="3"
        maxlength="50"
        show-word-limit
      />
    </van-dialog>

    <!-- 上传头像 -->
    <van-uploader
      v-model="fileList"
      :max-count="1"
      :before-read="beforeRead"
      :after-read="afterRead"
      v-show="false"
      ref="uploader"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { showSuccessToast, showFailToast } from 'vant';
import axios from 'axios';
import Mock from 'mockjs';

const router = useRouter();

// 登录状态
const isLoggedIn = ref(false);

// 用户信息
const userInfo = reactive({
  id: '',
  nickname: '',
  avatar: '',
  signature: ''
});

// 编辑昵称相关
const showNicknameDialog = ref(false);
const editingNickname = ref('');
const nicknameError = ref('');

// 编辑个性签名相关
const showSignatureDialog = ref(false);
const editingSignature = ref('');

// 上传头像相关
const fileList = ref([]);
const uploader = ref(null);

// 获取用户登录状态
const checkLoginStatus = async () => {
  try {
    const res = await axios.get('/user/check-login');
    if (res.data.code === 200) {
      isLoggedIn.value = res.data.data.isLoggedIn;
      // 如果已登录，获取用户信息
      if (isLoggedIn.value) {
        getUserInfo();
      }
    }
  } catch (error) {
    console.error('获取登录状态失败', error);
  }
};

// 获取用户信息
const getUserInfo = async () => {
  try {
    // 从API获取用户信息
    const res = await axios.get('/user/info');
    if (res.data.code === 200) {
      Object.assign(userInfo, res.data.data);
    }
  } catch (error) {
    console.error('获取用户信息失败', error);
    // 如果API请求失败，尝试从localStorage获取
    const userInfoStr = localStorage.getItem('userInfo');
    if (userInfoStr) {
      Object.assign(userInfo, JSON.parse(userInfoStr));
    }
  }
};

// 跳转到登录页面
const goToLogin = () => {
  router.push('/login');
};

// 跳转到注册页面
const goToRegister = () => {
  router.push('/register');
};

// 退出登录
const logout = async () => {
  try {
    // 可以添加退出登录的API请求
    // await axios.post('/api/user/logout');
    
    // 清除本地存储中的用户信息和登录状态
    localStorage.removeItem('userInfo');
    localStorage.removeItem('isLoggedIn');
    
    // 重置用户信息
    Object.assign(userInfo, {
      id: '',
      nickname: '',
      avatar: '',
      signature: ''
    });
    
    // 更新登录状态
    isLoggedIn.value = false;
    
    showSuccessToast('已退出登录');
  } catch (error) {
    console.error('退出登录失败', error);
    showFailToast('退出失败，请重试');
  }
};

// 编辑昵称
const editNickname = () => {
  editingNickname.value = userInfo.nickname;
  nicknameError.value = '';
  showNicknameDialog.value = true;
};

// 保存昵称
const saveNickname = async () => {
  if (!editingNickname.value.trim()) {
    nicknameError.value = '昵称不能为空';
    return false;
  }

  try {
    // 检查昵称是否已存在
    const checkRes = await axios.post('/user/check-nickname', {
      nickname: editingNickname.value
    });

    if (checkRes.data.code !== 200) {
      nicknameError.value = checkRes.data.message;
      return false;
    }

    // 更新昵称
    const updateRes = await axios.post('/user/update', {
      nickname: editingNickname.value
    });

    if (updateRes.data.code === 200) {
      userInfo.nickname = editingNickname.value;
      showSuccessToast('昵称修改成功');
      return true;
    }
  } catch (error) {
    console.error('保存昵称失败', error);
    showFailToast('保存失败，请重试');
    return false;
  }
};

// 编辑个性签名
const editSignature = () => {
  editingSignature.value = userInfo.signature || '';
  showSignatureDialog.value = true;
};

// 保存个性签名
const saveSignature = async () => {
  try {
    const res = await axios.post('/user/update', {
      signature: editingSignature.value
    });

    if (res.data.code === 200) {
      userInfo.signature = editingSignature.value;
      
      // 将更新后的用户信息保存到localStorage
      const userInfoStr = localStorage.getItem('userInfo');
      let storedUserInfo = userInfoStr ? JSON.parse(userInfoStr) : {};
      storedUserInfo.signature = editingSignature.value;
      localStorage.setItem('userInfo', JSON.stringify(storedUserInfo));
      
      showSuccessToast('个性签名修改成功');
      return true;
    }
  } catch (error) {
    console.error('保存个性签名失败', error);
    showFailToast('保存失败，请重试');
    return false;
  }
};

// 上传头像前的校验
const beforeRead = (file) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  const maxSize = 2 * 1024 * 1024; // 2MB

  if (!allowedTypes.includes(file.type)) {
    showFailToast('请上传 jpg、png、gif 格式图片');
    return false;
  }

  if (file.size > maxSize) {
    showFailToast('图片大小不能超过 2MB');
    return false;
  }

  return true;
};

// 上传头像后的处理
const afterRead = async (file) => {
  try {
    // 实际项目中应该上传到服务器
    // const formData = new FormData();
    // formData.append('file', file.file);
    // const res = await axios.post('/api/user/upload-avatar', formData);

    // 模拟上传成功
    const res = await axios.post('/user/upload-avatar');
    if (res.data.code === 200) {
      userInfo.avatar = res.data.data.url;
      showSuccessToast('头像上传成功');
      // 清空上传列表
      fileList.value = [];
    }
  } catch (error) {
    console.error('上传头像失败', error);
    showFailToast('上传失败，请重试');
  }
};

// 点击头像触发上传
const uploadAvatar = () => {
  uploader.value.chooseFile();
};

// 跳转到订单页面
const goToOrders = () => {
  router.push('/orders');
  // showSuccessToast('跳转到订单页面');
};

// 跳转到地址管理页面
const goToAddress = () => {
  router.push('/address');
  // showSuccessToast('跳转到地址管理页面');
};

// 页面加载时检查登录状态
onMounted(() => {
  checkLoginStatus();
});
</script>

<style scoped>
.profile {
  padding: 0;
  background-color: #f7f8fa;
  min-height: 100vh;
}

.profile-header {
  background-color: #1989fa;
  color: white;
  padding: 15px;
  text-align: center;
}

.profile-header h2 {
  margin: 0;
  font-size: 18px;
}

/* 未登录状态样式 */
.not-logged-in {
  background-color: white;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 15px;
}

.avatar-placeholder {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #f2f3f5;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 10px;
}

.login-info {
  text-align: center;
  margin-bottom: 15px;
}

.login-info p {
  margin: 5px 0;
}

.login-tip {
  color: #999;
  font-size: 14px;
}

.login-buttons {
  display: flex;
  gap: 15px;
}

/* 已登录状态样式 */
.user-info {
  background-color: white;
  margin-bottom: 15px;
}

.user-header {
  padding: 20px;
  display: flex;
  position: relative;
}

.avatar {
  position: relative;
  margin-right: 15px;
}

.avatar-edit {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  font-size: 12px;
  text-align: center;
  padding: 2px 0;
  border-bottom-left-radius: 35px;
  border-bottom-right-radius: 35px;
}

.user-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.nickname {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
}

.nickname span {
  margin-right: 5px;
}

.signature {
  color: #666;
  font-size: 14px;
  display: flex;
  align-items: center;
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.signature span {
  margin-right: 5px;
}

.logout-btn {
  position: absolute;
  top: 20px;
  right: 20px;
}

.user-functions {
  padding: 10px 0;
}
</style>