<template>
  <div class="orders-container">
    <div class="orders-header">
      <van-nav-bar
        title="我的订单"
        left-arrow
        @click-left="onClickLeft"
      />
    </div>
    
    <div v-if="orders.length > 0" class="orders-list">
      <!-- 遍历每个订单 -->
      <div v-for="order in orders" :key="order.orderId" class="order-card">
        <div class="order-header">
          <div class="order-time">{{ order.createTime }}</div>
        </div>
        
        <!-- 遍历订单中的商品 -->
        <div v-for="item in order.items" :key="item.id" class="order-item">
          <div class="product-info">
            <img :src="item.thumb" class="product-image" />
            <div class="product-details">
              <div class="product-title">{{ item.title }}</div>
              <div class="product-price">¥{{ item.price.toFixed(2) }}</div>
            </div>
            <div class="product-quantity">x{{ item.quantity }}</div>
          </div>
        </div>
        
        <div class="order-total">
          实付款：¥ {{ calculateOrderTotal(order.items) }}
        </div>
      </div>
    </div>
    
    <div v-else class="empty-orders">
      <van-empty description="暂无订单" />
      <div style="margin: 16px;">
        <van-button round block type="primary" @click="goShopping">
          去购物
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { showSuccessToast } from 'vant';
import axios from 'axios';
import Mock from 'mockjs';

const router = useRouter();
const orders = ref([]);

// 模拟获取订单数据
const getOrders = async () => {
  try {
    const res = await axios.get('orders'); // 移除前导斜杠以使用baseURL
    if (res.data.code === 200) {
      orders.value = res.data.data;
      console.log("orders:", orders.value);
    }
  } catch (error) {
    console.error('获取订单列表失败', error);
  }
};

// 计算单个订单总价
const calculateOrderTotal = (items) => {
  return items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0).toFixed(2);
};

// 返回上一页
const onClickLeft = () => {
  router.back();
};

// 去购物
const goShopping = () => {
  router.push('/home');
};

onMounted(() => {
  getOrders();
});
</script>

<style scoped>
.orders-container {
  height: 100vh;
  background-color: #f7f8fa;
  /* 覆盖底部导航栏 */
  position: relative;
  z-index: 1000;
}

/* 只在当前页面隐藏底部导航栏 */
.orders-container::after {
  content: '';
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50px;
  background-color: #f7f8fa;
  z-index: 999;
}

.orders-header {
  position: sticky;
  top: 0;
  z-index: 100;
}

.orders-list {
  padding: 16px;
  /* 添加底部空白区域，避免内容被遮挡 */
  padding-bottom: 100px;
}

.order-card {
  margin-bottom: 16px;
  background-color: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(100, 101, 102, 0.08);
}

.order-header {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  background-color: #fafafa;
  text-align: right;
}

.order-time {
  font-size: 12px;
  color: #969799;
}

.order-item {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.order-item:last-of-type {
  border-bottom: none;
}

.product-info {
  display: flex;
  align-items: center;
}

.product-image {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  margin-right: 12px;
  object-fit: cover;
}

.product-details {
  flex: 1;
}

.product-title {
  font-size: 14px;
  color: #323233;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.product-price {
  font-size: 16px;
  color: #ee0a24;
  font-weight: 500;
}

.product-quantity {
  font-size: 14px;
  color: #969799;
}

.order-total {
  padding: 16px;
  text-align: right;
  font-size: 16px;
  font-weight: 500;
  color: #323233;
  background-color: #fafafa;
}

.empty-orders {
  padding: 40px 20px;
  /* 为空状态也添加底部空白区域 */
  padding-bottom: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>