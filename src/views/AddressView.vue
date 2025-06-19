<template>
  <div class="address-container">
    <van-nav-bar
      :title="isSelectMode ? '选择收货地址' : '收货地址'"
      left-arrow
      @click-left="onClickLeft"
      :right-text="isSelectMode ? '' : '添加'"
      @click-right="onClickRight"
    />
    
    <div v-if="addresses.length > 0" class="address-list">
      <van-swipe-cell
        v-for="(address, index) in addresses"
        :key="index"
        :right-width="isSelectMode ? 0 : 65"
        :stop-propagation="true"
      >
        <van-cell-group inset>
          <van-cell :border="false" @click="isSelectMode ? selectAddress(address) : null">
            <template #title>
              <div class="address-info">
                <div class="address-header">
                  <van-radio
                    v-if="isSelectMode"
                    :name="address.id"
                    v-model="selectedAddressId"
                    class="address-radio"
                  />
                  <span class="name">{{ address.name }}</span>
                  <span class="phone">{{ address.phone }}</span>
                  <van-tag type="primary" v-if="address.isDefault">默认</van-tag>
                </div>
                <div class="address-detail">{{ address.province }} {{ address.city }} {{ address.county }} {{ address.addressDetail }}</div>
              </div>
            </template>
            <template #right-icon v-if="!isSelectMode">
              <van-icon name="edit" class="edit-icon" @click="editAddress(index)" />
            </template>
          </van-cell>
        </van-cell-group>
        <template #right v-if="!isSelectMode">
          <div class="delete-button" @click="deleteAddress(index)">
            <span>删除</span>
          </div>
        </template>
      </van-swipe-cell>
    </div>
    
    <div v-else class="empty-address">
      <van-empty description="暂无收货地址" />
      <van-button type="primary" block @click="onClickRight" v-if="!isSelectMode">添加收货地址</van-button>
    </div>
    
    <!-- 选择模式下的确认按钮 -->
    <div v-if="isSelectMode" class="confirm-bar">
      <van-button type="primary" block @click="confirmSelection" :disabled="!selectedAddressId">
        确认选择
      </van-button>
    </div>
    
    <van-popup v-model:show="showAddressForm" position="bottom" :style="{ height: '90%' }">
      <van-nav-bar
        :title="isEditing ? '编辑收货地址' : '新增收货地址'"
        left-text="取消"
        right-text="保存"
        @click-left="showAddressForm = false"
        @click-right="saveAddress"
      />
      <van-form class="address-form">
        <van-cell-group inset>
          <van-field
            v-model="addressForm.name"
            name="name"
            label="收货人"
            placeholder="请输入收货人姓名"
            :rules="[{ required: true, message: '请填写收货人姓名' }]"
          />
          <van-field
            v-model="addressForm.phone"
            name="phone"
            label="手机号"
            placeholder="请输入手机号"
            :rules="[{ required: true, message: '请填写手机号' }]"
          />
          <van-field
            v-model="areaText"
            is-link
            readonly
            name="area"
            label="地区"
            placeholder="请选择省市区"
            @click="openAreaPicker"
          />
          <van-field
            v-model="addressForm.addressDetail"
            name="addressDetail"
            label="详细地址"
            placeholder="请输入详细地址"
            :rules="[{ required: true, message: '请填写详细地址' }]"
          />
          <van-cell center title="设为默认收货地址">
            <template #right-icon>
              <van-switch v-model="addressForm.isDefault" size="24" />
            </template>
          </van-cell>
        </van-cell-group>
      </van-form>
    </van-popup>
    
    <van-popup v-model:show="showAreaPicker" position="bottom">
      <van-area
        title="选择地区"
        :area-list="areaList"
        value-key="name"
        @confirm="onAreaConfirm"
        @cancel="showAreaPicker = false"
      />
    </van-popup>
  </div>
</template>

<script setup>
import { ref, reactive, computed, nextTick, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { showSuccessToast, showFailToast } from 'vant';
import { areaList } from '@vant/area-data';
import axios from 'axios';
import Mock from 'mockjs';

const router = useRouter();
const route = useRoute();
const addresses = ref([]);
const showAddressForm = ref(false);
const showAreaPicker = ref(false);
const isEditing = ref(false);
const editingIndex = ref(-1);

// 选择模式相关
const isSelectMode = computed(() => route.query.mode === 'select');
const selectedAddressId = ref(null);

// 地址表单
const addressForm = reactive({
  name: '',
  phone: '',
  province: '',
  city: '',
  county: '',
  addressDetail: '',
  isDefault: false
});

// 计算属性：地区文本
const areaText = computed(() => {
  if (addressForm.province && addressForm.city && addressForm.county) {
    return `${addressForm.province} ${addressForm.city} ${addressForm.county}`;
  }
  return '';
});

// 打开地区选择器
const openAreaPicker = () => {
  showAreaPicker.value = true;
};

// 保存地址到本地存储
const saveAddressesToStorage = () => {
  localStorage.setItem('userAddresses', JSON.stringify(addresses.value));
};

// 从本地存储加载地址
const loadAddressesFromStorage = () => {
  const storedAddresses = localStorage.getItem('userAddresses');
  if (storedAddresses) {
    addresses.value = JSON.parse(storedAddresses);
    return true;
  }
  return false;
};

// 模拟获取地址数据
const getAddresses = async () => {
  // 先尝试从本地存储加载
  if (loadAddressesFromStorage()) {
    console.log('从本地存储加载地址数据成功');
    return;
  }
  
  // 如果本地没有，则从API获取
  try {
    const res = await axios.get('/addresses');
    if (res.data.code === 200) {
      addresses.value = res.data.data;
      // 将初始数据也保存到本地存储
      saveAddressesToStorage();
    }
  } catch (error) {
    console.error('获取地址列表失败', error);
  }
};

// 选择地址
const selectAddress = (address) => {
  selectedAddressId.value = address.id;
};

// 确认选择
const confirmSelection = () => {
  const selectedAddress = addresses.value.find(addr => addr.id === selectedAddressId.value);
  if (selectedAddress) {
    // 将选择的地址保存到localStorage
    localStorage.setItem('selectedAddress', JSON.stringify(selectedAddress));
    showSuccessToast('地址选择成功');
    // 返回确认订单页面
    router.back();
  }
};

// 返回上一页
const onClickLeft = () => {
  router.back();
};

// 添加地址
const onClickRight = () => {
  if (isSelectMode.value) return; // 选择模式下不显示添加按钮
  resetAddressForm();
  isEditing.value = false;
  showAddressForm.value = true;
};

// 编辑地址
const editAddress = (index) => {
  const address = addresses.value[index];
  Object.assign(addressForm, address);
  isEditing.value = true;
  editingIndex.value = index;
  showAddressForm.value = true;
};

// 删除地址
const deleteAddress = (index) => {
  addresses.value.splice(index, 1);
  // 删除后保存到本地存储
  saveAddressesToStorage();
  showSuccessToast('删除成功');
};

// 保存地址
const saveAddress = () => {
  // 表单验证
  if (!addressForm.name || !addressForm.phone || !addressForm.province || !addressForm.addressDetail) {
    showFailToast('请完善地址信息');
    return;
  }
  
  if (isEditing.value) {
    // 编辑现有地址
    Object.assign(addresses.value[editingIndex.value], addressForm);
    
    // 如果设为默认地址，需要将其他地址设为非默认
    if (addressForm.isDefault) {
      addresses.value.forEach((item, index) => {
        if (index !== editingIndex.value) {
          item.isDefault = false;
        }
      });
    }
    
    showSuccessToast('修改成功');
  } else {
    // 添加新地址
    const newAddress = { ...addressForm, id: Date.now() };
    
    // 如果设为默认地址，需要将其他地址设为非默认
    if (newAddress.isDefault) {
      addresses.value.forEach(item => {
        item.isDefault = false;
      });
    }
    
    addresses.value.push(newAddress);
    showSuccessToast('添加成功');
  }
  
  // 保存到本地存储
  saveAddressesToStorage();
  showAddressForm.value = false;
};

// 地区选择确认
const onAreaConfirm = (values) => {
  try {
    console.log('地区选择值:', values);
    
    // 处理空值情况
    if (!values || !values.selectedOptions || values.selectedOptions.length === 0) {
      console.error('地区选择值为空');
      showFailToast('请选择地区');
      return;
    }
    
    const selectedOptions = values.selectedOptions;
    
    // 提取省市区信息
    const province = selectedOptions[0]?.text || '';
    const city = selectedOptions[1]?.text || '';
    const county = selectedOptions[2]?.text || '';
    
    console.log('解析的地区值:', { province, city, county });
    
    // 更新表单数据
    addressForm.province = province;
    addressForm.city = city;
    addressForm.county = county;
    
    // 只要有省份信息就认为选择成功
    if (province) {
      showSuccessToast('地区选择完成');
    } else {
      showFailToast('请选择地区');
      return;
    }
  } catch (error) {
    console.error('地区选择处理错误:', error);
    showFailToast('地区选择处理出错');
    return;
  } finally {
    // 无论成功失败都关闭选择器
    showAreaPicker.value = false;
  }
};

// 重置地址表单
const resetAddressForm = () => {
  addressForm.name = '';
  addressForm.phone = '';
  addressForm.province = '';
  addressForm.city = '';
  addressForm.county = '';
  addressForm.addressDetail = '';
  addressForm.isDefault = false;
};

// 页面加载时获取地址列表
onMounted(() => {
  getAddresses();
  // 如果是选择模式，设置默认选中的地址
  if (isSelectMode.value) {
    const defaultAddr = addresses.value.find(addr => addr.isDefault);
    if (defaultAddr) {
      selectedAddressId.value = defaultAddr.id;
    }
  }
});
</script>

<style scoped>
.address-container {
  padding-bottom: 50px;
  /* 覆盖底部导航栏 */
  position: relative;
  z-index: 1000;
}

/* 只在当前页面覆盖底部导航栏 */
.address-container::after {
  content: '';
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50px;
  background-color: #f7f8fa;
  z-index: 999;
}

.address-list {
  padding: 10px 0;
}

.address-info {
  padding: 5px 0;
}

.address-header {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
}

.address-radio {
  margin-right: 10px;
}

.name {
  font-weight: bold;
  margin-right: 10px;
}

.phone {
  margin-right: 10px;
  color: #666;
}

.address-detail {
  color: #666;
  font-size: 14px;
  margin-left: 32px; /* 为单选框留出空间 */
}

.edit-icon {
  font-size: 20px;
  color: #1989fa;
}

.empty-address {
  padding: 40px 20px;
}

.empty-address .van-button {
  margin-top: 20px;
}

.address-form {
  padding: 20px 0;
}

.delete-button {
  height: 100%;
  width: 65px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ee0a24;
  color: white;
  font-size: 14px;
}

/* 确认按钮样式 */
.confirm-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 10px 16px;
  background-color: #fff;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  z-index: 1001;
}
</style>