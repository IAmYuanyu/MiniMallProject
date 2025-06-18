<template>
  <div class="confirm-order">
    <van-nav-bar
      title="确认订单"
      left-arrow
      @click-left="onClickLeft"
      fixed
      placeholder
    />
    
    <!-- 收货地址 -->
    <div class="address-card" v-if="defaultAddress">
      <div class="address-info">
        <div class="user-info">
          <span class="name">姓名：{{ defaultAddress.name }}</span>
          <span class="phone">电话：{{ defaultAddress.phone }}</span>
          <van-icon name="arrow" class="arrow-icon" />
        </div>
        <div class="address-detail">
          {{ formatAddress(defaultAddress) }}
        </div>
      </div>
      <div class="address-divider">
        <van-divider dashed :style="{ color: '#1989fa', borderColor: '#1989fa', padding: '0 16px' }" />
      </div>
    </div>
    
    <!-- 商品列表 -->
    <div class="order-products">
      <div class="product-item" v-for="item in orderItems" :key="item.id">
        <div class="product-image">
          <img :src="item.product.image" :alt="item.product.title" />
        </div>
        <div class="product-info">
          <div class="product-title">{{ item.product.title }}</div>
          <div class="product-price-quantity">
            <div class="product-price">¥{{ item.product.price.toFixed(2) }}</div>
            <div class="product-quantity">x{{ item.quantity }}</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 订单金额 -->
    <div class="order-amount">
      <div class="amount-item">
        <span>商品金额</span>
        <span>¥{{ totalPrice.toFixed(2) }}</span>
      </div>
      <div class="amount-item">
        <span>优惠</span>
        <span>¥0.00</span>
      </div>
      <div class="amount-item total">
        <span>实付款</span>
        <span class="total-price">¥{{ totalPrice.toFixed(2) }}</span>
      </div>
    </div>
    
    <!-- 底部提交栏 -->
    <div class="submit-bar">
      <div class="price-info">
        合计：<span class="price">¥{{ totalPrice.toFixed(2) }}</span>
      </div>
      <van-button type="danger" class="submit-button" @click="submitOrder">提交订单</van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showSuccessToast, showLoadingToast } from 'vant'
import axios from 'axios'

const router = useRouter()
const orderItems = ref([])
const defaultAddress = ref(null)

// 获取默认地址
const getDefaultAddress = async () => {
  try {
    const res = await axios.get('/addresses')
    if (res.data.code === 200) {
      // 获取默认地址
      const defaultAddr = res.data.data.find(addr => addr.isDefault) || res.data.data[0]
      defaultAddress.value = defaultAddr
    }
  } catch (error) {
    console.error('获取地址失败', error)
    showToast('获取地址失败')
  }
}

// 获取订单商品（从购物车中选择的商品）
const getOrderItems = async () => {
  try {
    // 从localStorage获取临时保存的订单商品
    const orderItemsStr = localStorage.getItem('confirmOrderItems')
    if (orderItemsStr) {
      orderItems.value = JSON.parse(orderItemsStr)
    } else {
      // 如果没有临时保存的订单商品，则获取购物车中选中的商品
      const res = await axios.get('/cart')
      if (res.data.code === 200) {
        // 过滤出选中的商品
        orderItems.value = res.data.data.filter(item => item.selected)
        // 如果没有选中的商品，返回购物车页面
        if (orderItems.value.length === 0) {
          showToast('请先选择商品')
          router.push('/cart')
          return
        }
      }
    }
  } catch (error) {
    console.error('获取订单商品失败', error)
    showToast('获取订单商品失败')
  }
}

// 格式化地址
const formatAddress = (address) => {
  if (!address) return ''
  return `${address.province} ${address.city} ${address.county} ${address.addressDetail}`
}

// 计算总价
const totalPrice = computed(() => {
  return orderItems.value.reduce((sum, item) => {
    return sum + item.product.price * item.quantity
  }, 0)
})

// 提交订单
const submitOrder = async () => {
  if (orderItems.value.length === 0) {
    showToast('请先选择商品')
    return
  }
  
  if (!defaultAddress.value) {
    showToast('请先添加收货地址')
    return
  }
  
  const loading = showLoadingToast({
    message: '提交订单中...',
    forbidClick: true,
  })
  
  try {
    // 提交订单
    const res = await axios.post('/order/submit', {
      addressId: defaultAddress.value.id,
      items: orderItems.value.map(item => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity
      }))
    })
    
    if (res.data.code === 200) {
      loading.close()
      showSuccessToast('下单成功')
    //   localStorage.setItem('orders', localStorage.getItem('confirmOrderItems'))
    //   console.log(JSON.parse(localStorage.getItem('confirmOrderItems')));
    //   localStorage.setItem('orders', JSON.stringify(JSON.parse(localStorage.getItem('confirmOrderItems'))));
      console.log(res);
      
      
      // 清除临时保存的订单商品
      localStorage.removeItem('confirmOrderItems')
      // 跳转到订单页面
      router.push('/orders')
    }
  } catch (error) {
    loading.close()
    console.error('提交订单失败', error)
    showToast('提交订单失败')
  }
}

// 返回上一页
const onClickLeft = () => {
  router.back()
}

onMounted(() => {
  getDefaultAddress()
  getOrderItems()
})
</script>

<style scoped>
.confirm-order {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 60px; /* 为底部提交栏留出空间 */
}

.address-card {
  margin: 12px;
  background-color: #fff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(100, 101, 102, 0.08);
}

.address-info {
  position: relative;
}

.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.name {
  font-size: 16px;
  font-weight: bold;
  margin-right: 12px;
}

.phone {
  font-size: 14px;
  color: #666;
}

.arrow-icon {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
}

.address-detail {
  font-size: 14px;
  color: #333;
  line-height: 1.5;
}

.order-products {
  margin: 12px;
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(100, 101, 102, 0.08);
}

.product-item {
  display: flex;
  padding: 16px;
  border-bottom: 1px solid #f5f5f5;
}

.product-item:last-child {
  border-bottom: none;
}

.product-image {
  width: 80px;
  height: 80px;
  margin-right: 12px;
  overflow: hidden;
  border-radius: 4px;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.product-title {
  font-size: 14px;
  margin-bottom: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.product-price-quantity {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-price {
  color: #f44;
  font-weight: bold;
}

.product-quantity {
  color: #999;
}

.order-amount {
  margin: 12px;
  background-color: #fff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(100, 101, 102, 0.08);
}

.amount-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 14px;
  color: #666;
}

.amount-item.total {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f5f5f5;
  font-weight: bold;
  color: #333;
}

.total-price {
  color: #f44;
  font-size: 16px;
}

.submit-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background-color: #fff;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  z-index: 10;
}

.price-info {
  font-size: 14px;
}

.price {
  color: #f44;
  font-weight: bold;
  font-size: 18px;
}

.submit-button {
  border-radius: 20px;
  padding: 0 20px;
}
</style>