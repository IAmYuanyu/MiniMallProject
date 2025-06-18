<template>
  <div class="orders-container">
    <div class="orders-header">
      <van-nav-bar
        title="我的订单"
        left-arrow
        @click-left="onClickLeft"
      />
    </div>
    
    <div v-if="orders.length > 0" class="order-card">
      <div v-for="order in orders" :key="order.id" class="order-item">
        <div class="product-info">
          <img :src="order.thumb" class="product-image" />
          <div class="product-details">
            <div class="product-title">{{ order.title }}</div>
            <div class="product-price">¥{{ order.price.toFixed(2) }}</div>
          </div>
          <div class="product-quantity">x{{ order.quantity }}</div>
        </div>
      </div>
      <div class="order-total">
        实付款：¥ {{ calculateTotal() }}
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
    const res = await axios.get('/orders');
    if (res.data.code === 200) {
      orders.value = res.data.data;
    }
  } catch (error) {
    console.error('获取订单列表失败', error);
  }
};

// 计算总价
const calculateTotal = () => {
  return orders.value.reduce((total, order) => {
    return total + (order.price * order.quantity);
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
}

.orders-header {
  position: sticky;
  top: 0;
  z-index: 100;
}

.order-card {
  margin: 16px;
  background-color: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(100, 101, 102, 0.08);
}

.order-item {
  padding: 16px;
  border-bottom: 1px solid #f5f5f5;
}

.order-item:last-child {
  border-bottom: none;
}

.product-info {
  display: flex;
  align-items: center;
}

.product-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  margin-right: 12px;
  border-radius: 4px;
}

.product-details {
  flex: 1;
}

.product-title {
  font-size: 16px;
  margin-bottom: 8px;
  color: #323233;
}

.product-price {
  color: #ff6034;
  font-size: 16px;
  font-weight: 500;
}

.product-quantity {
  color: #969799;
  font-size: 14px;
  margin-left: 12px;
}

.order-total {
  text-align: right;
  padding: 16px;
  font-weight: bold;
  font-size: 16px;
  color: #323233;
}

.empty-orders {
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>