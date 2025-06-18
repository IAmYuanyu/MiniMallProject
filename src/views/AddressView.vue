<template>
  <div class="address-container">
    <van-nav-bar
      title="收货地址"
      left-arrow
      @click-left="onClickLeft"
      right-text="添加"
      @click-right="onClickRight"
    />
    
    <div v-if="addresses.length > 0" class="address-list">
      <van-swipe-cell
        v-for="(address, index) in addresses"
        :key="index"
        :right-width="65"
        :stop-propagation="true"
      >
        <van-cell-group inset>
          <van-cell :border="false">
            <template #title>
              <div class="address-info">
                <div class="address-header">
                  <span class="name">{{ address.name }}</span>
                  <span class="phone">{{ address.phone }}</span>
                  <van-tag type="primary" v-if="address.isDefault">默认</van-tag>
                </div>
                <div class="address-detail">{{ address.province }} {{ address.city }} {{ address.county }} {{ address.addressDetail }}</div>
              </div>
            </template>
            <template #right-icon>
              <van-icon name="edit" class="edit-icon" @click="editAddress(index)" />
            </template>
          </van-cell>
        </van-cell-group>
        <template #right>
          <div class="delete-button" @click="deleteAddress(index)">
            <span>删除</span>
          </div>
        </template>
      </van-swipe-cell>
    </div>
    
    <div v-else class="empty-address">
      <van-empty description="暂无收货地址" />
      <van-button type="primary" block @click="onClickRight">添加收货地址</van-button>
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
// 在 <script setup> 部分导入 nextTick
import { ref, reactive, computed, nextTick } from 'vue';

// 添加一个打开地区选择器的方法
const openAreaPicker = () => {
  nextTick(() => {
    showAreaPicker.value = true;
  });
};
import { useRouter } from 'vue-router';
import { showSuccessToast, showFailToast } from 'vant';
import { areaList } from '@vant/area-data';
import axios from 'axios';
import Mock from 'mockjs';

const router = useRouter();
const addresses = ref([]);
const showAddressForm = ref(false);
const showAreaPicker = ref(false);
const isEditing = ref(false);
const editingIndex = ref(-1);

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

// 模拟获取地址数据
const getAddresses = async () => {
  try {
    const res = await axios.get('/addresses');
    if (res.data.code === 200) {
      addresses.value = res.data.data;
    }
  } catch (error) {
    console.error('获取地址列表失败', error);
  }
};

// 返回上一页
const onClickLeft = () => {
  router.back();
};

// 添加地址
const onClickRight = () => {
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
  
  showAddressForm.value = false;
};

// 地区选择确认
const onAreaConfirm = (values) => {
  try {
    // 添加更详细的调试信息
    console.log('地区选择值:', values);
    console.log(values.selectedOptions[0].text);
    console.log(values.selectedOptions[1].text);
    console.log(values.selectedOptions[2].text);
    
    console.log('地区选择值类型:', typeof values);
    console.log('是否为数组:', Array.isArray(values));
    if (Array.isArray(values)) {
      console.log('数组长度:', values.length);
      values.forEach((item, index) => {
        console.log(`第${index+1}项:`, item, '类型:', typeof item);
      });
    }
    
    // 处理空值情况
    if (!values) {
      console.error('地区选择值为空');
      showFailToast('请选择地区');
      return;
    }
    
    // 确保values是数组
    if (!Array.isArray(values)) {
      // 尝试处理可能的非数组情况
      if (typeof values === 'object') {
        // 如果是单个对象，尝试提取省市区信息
        const province = values.selectedOptions[0].text || values.province || '';
        const city = values.selectedOptions[1].text || values.city || '';
        const county = values.selectedOptions[2].text || values.county || '';
        
        addressForm.province = province;
        addressForm.city = city;
        addressForm.county = county;
        
        if (province || city || county) {
          showSuccessToast('地区选择完成');
          showAreaPicker.value = false;
          return;
        } else {
          showFailToast('地区信息不完整');
          return;
        }
      } else {
        console.error('地区选择数据格式错误:', values);
        showFailToast('地区选择数据格式错误');
        return;
      }
    }
    
    // 处理数组情况
    let province = '', city = '', county = '';
    
    // 适配不同的数据结构
    if (values.length > 0) {
      if (values[0] && typeof values[0] === 'object') {
        // 尝试所有可能的属性名
        province = values[0].name || values[0].text || values[0].label || values[0].value || '';
        city = values[1]?.name || values[1]?.text || values[1]?.label || values[1]?.value || '';
        county = values[2]?.name || values[2]?.text || values[2]?.label || values[2]?.value || '';
      } else if (typeof values[0] === 'string') {
        // 如果是字符串数组，直接使用
        province = values[0] || '';
        city = values[1] || '';
        county = values[2] || '';
      }
    }
    
    console.log('解析的地区值:', { province, city, county });
    
    // 更新表单数据
    addressForm.province = province;
    addressForm.city = city;
    addressForm.county = county;
    
    // 只要有一个值存在，就认为选择了地区
    if (province || city || county) {
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
getAddresses();
</script>

<style scoped>
.address-container {
  padding-bottom: 50px;
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
</style>