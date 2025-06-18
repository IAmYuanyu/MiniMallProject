<template>
  <div class="cart">
    <van-nav-bar title="购物车" fixed placeholder />
    
    <div class="cart-container">
      <!-- 购物车为空时显示 -->
      <van-empty v-if="cartItems.length === 0" description="购物车还是空的" />
      
      <!-- 购物车商品列表 -->
      <div v-else class="cart-list">
        <van-swipe-cell v-for="item in cartItems" :key="item.id">
          <div class="cart-item">
            <van-checkbox 
              :model-value="item.selected" 
              @update:model-value="updateSelected(item.id, $event)"
              icon-size="20px"
              class="item-checkbox"
            />
            
            <div class="item-content">
              <div class="item-img">
                <img :src="item.product.image" :alt="item.product.title" />
              </div>
              
              <div class="item-info">
                <div class="item-title">{{ item.product.title }}</div>
                <div class="item-price-stepper">
                  <div class="item-price">¥{{ item.product.price.toFixed(2) }}</div>
                  <van-stepper 
                    v-model="item.quantity" 
                    theme="round"
                    button-size="22"
                    disable-input
                    @change="updateQuantity(item.id, $event)"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <!-- 滑动删除按钮 -->
          <template #right>
            <van-button 
              square 
              text="删除" 
              type="danger" 
              class="delete-button"
              @click="removeItem(item.id)"
            />
          </template>
        </van-swipe-cell>
      </div>
    </div>
    
    <!-- 底部结算栏 -->
    <div class="cart-footer">
      <div class="select-all">
        <van-checkbox 
          :model-value="isAllSelected" 
          @update:model-value="selectAll"
          icon-size="20px"
        >全选</van-checkbox>
      </div>
      
      <div class="total-info">
        <div class="total-price">
          合计: <span class="price">¥{{ totalPrice.toFixed(2) }}</span>
        </div>
        
        <van-button 
          type="danger" 
          class="checkout-button" 
          :disabled="selectedCount === 0"
          @click="checkout"
        >
          结算 ({{ selectedCount }})
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { showToast, showSuccessToast, showLoadingToast } from 'vant'
import axios from 'axios'
import { useRouter } from 'vue-router'  // 添加这一行导入useRouter

// 初始化router对象
const router = useRouter()  // 添加这一行初始化router

// 购物车商品列表
const cartItems = ref([])

// 获取购物车数据
const fetchCartItems = async () => {
  try {
    const res = await axios.get('/cart')
    if (res.data.code === 200) {
      cartItems.value = res.data.data
    }
  } catch (error) {
    console.error('获取购物车失败', error)
    showToast('获取购物车失败')
  }
}

// 更新商品数量
const updateQuantity = async (id, quantity) => {
  if (quantity < 1) return
  
  try {
    const res = await axios.post('/cart/update', { id, quantity })
    if (res.data.code === 200) {
      // 更新成功，无需额外操作，因为已经通过v-model更新了本地数据
    }
  } catch (error) {
    console.error('更新数量失败', error)
    showToast('更新数量失败')
    // 恢复原数量
    fetchCartItems()
  }
}

// 更新商品选中状态
const updateSelected = async (id, selected) => {
  try {
    const res = await axios.post('/cart/select', { id, selected })
    if (res.data.code === 200) {
      // 更新本地数据
      const item = cartItems.value.find(item => item.id === id)
      if (item) {
        item.selected = selected
      }
    }
  } catch (error) {
    console.error('更新选中状态失败', error)
    showToast('更新选中状态失败')
  }
}

// 全选/取消全选
const selectAll = async (selected) => {
  try {
    const res = await axios.post('/cart/select', { id: 'all', selected })
    if (res.data.code === 200) {
      // 更新本地数据
      cartItems.value.forEach(item => item.selected = selected)
    }
  } catch (error) {
    console.error('全选操作失败', error)
    showToast('全选操作失败')
  }
}

// 从购物车中删除商品
const removeItem = async (id) => {
  try {
    const res = await axios.post('/cart/remove', { id })
    if (res.data.code === 200) {
      // 更新本地数据
      const index = cartItems.value.findIndex(item => item.id === id)
      if (index !== -1) {
        cartItems.value.splice(index, 1)
        showSuccessToast('删除成功')
      }
    }
  } catch (error) {
    console.error('删除商品失败', error)
    showToast('删除商品失败')
  }
}

// 结算
const checkout = async () => {
  if (selectedCount.value === 0) {
    showToast('请先选择商品')
    return
  }
  
  // 获取选中的商品
  const selectedItems = cartItems.value.filter(item => item.selected)
  
  // 将选中的商品保存到localStorage，供确认订单页面使用
  localStorage.setItem('confirmOrderItems', JSON.stringify(selectedItems))
  
  // 跳转到确认订单页面
  router.push('/confirmOrder')

  const loading = showLoadingToast({
    message: '结算中...',
    forbidClick: true,
  })

  try {
    const res = await axios.post('/cart/checkout')
    if (res.data.code === 200) {
      loading.close()
      showSuccessToast('结算成功')
      // 刷新购物车数据
      fetchCartItems()
    }
  } catch (error) {
    loading.close()
    console.error('结算失败', error)
    showToast('结算失败')
  }
}

// 计算属性：是否全选
const isAllSelected = computed(() => {
  return cartItems.value.length > 0 && cartItems.value.every(item => item.selected)
})

// 计算属性：已选商品数量
const selectedCount = computed(() => {
  return cartItems.value.filter(item => item.selected).length
})

// 计算属性：总价
const totalPrice = computed(() => {
  return cartItems.value
    .filter(item => item.selected)
    .reduce((sum, item) => sum + item.product.price * item.quantity, 0)
})

// 页面加载时获取购物车数据
onMounted(() => {
  fetchCartItems()
})
</script>

<style scoped>
.cart {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 50px); /* 减去底部导航栏的高度 */
  background-color: #f7f8fa;
}

.cart-container {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 60px; /* 增加底部padding，为结算栏留出空间 */
}

.cart-list {
  padding: 10px;
}

.cart-item {
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: #fff;
  border-radius: 8px;
  margin-bottom: 10px;
}

.item-checkbox {
  margin-right: 10px;
}

.item-content {
  display: flex;
  flex: 1;
}

.item-img {
  width: 80px;
  height: 80px;
  margin-right: 10px;
  overflow: hidden;
  border-radius: 4px;
}

.item-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.item-title {
  font-size: 14px;
  margin-bottom: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.item-price-stepper {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-price {
  color: #f44;
  font-weight: bold;
}

.delete-button {
  height: 100%;
}

.cart-footer {
  position: fixed;
  bottom: 50px; /* 将结算栏放在底部导航栏上方 */
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

.total-info {
  display: flex;
  align-items: center;
}

.total-price {
  margin-right: 10px;
  font-size: 14px;
}

.price {
  color: #f44;
  font-weight: bold;
  font-size: 18px;
}

.checkout-button {
  border-radius: 20px;
  padding: 0 20px;
}
</style>