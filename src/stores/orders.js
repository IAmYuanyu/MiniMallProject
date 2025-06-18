import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { showToast, showSuccessToast } from 'vant'
import axios from 'axios'

export const useOrdersStore = defineStore('orders', () => {
  // 状态
  const orders = ref([])
  const loading = ref(false)
  const lastFetchTime = ref(0)
  
  // 缓存时间（1分钟）
  const CACHE_TIME = 1 * 60 * 1000

  // 计算属性
  const orderCount = computed(() => orders.value.length)
  
  const totalOrderAmount = computed(() => {
    return orders.value.reduce((total, order) => {
      const orderTotal = order.items.reduce((sum, item) => {
        return sum + (item.price * item.quantity)
      }, 0)
      return total + orderTotal
    }, 0)
  })

  // 从本地存储加载订单
  const loadFromStorage = () => {
    const storedOrders = localStorage.getItem('orders')
    if (storedOrders) {
      orders.value = JSON.parse(storedOrders)
      return true
    }
    return false
  }

  // 保存到本地存储
  const saveToStorage = () => {
    localStorage.setItem('orders', JSON.stringify(orders.value))
  }

  // 获取订单列表
  const fetchOrders = async (force = false) => {
    const now = Date.now()
    if (!force && orders.value.length > 0 && (now - lastFetchTime.value) < CACHE_TIME) {
      return orders.value
    }

    try {
      loading.value = true
      
      // 先从本地存储加载
      if (!force && loadFromStorage()) {
        lastFetchTime.value = now
        return orders.value
      }
      
      // 从API获取
      const res = await axios.get('/orders')
      if (res.data.code === 200) {
        orders.value = res.data.data
        saveToStorage()
        lastFetchTime.value = now
      }
    } catch (error) {
      console.error('获取订单列表失败', error)
      // 如果API失败，尝试从本地存储加载
      loadFromStorage()
    } finally {
      loading.value = false
    }
    return orders.value
  }

  // 提交订单
  const submitOrder = async (orderData) => {
    try {
      loading.value = true
      
      const res = await axios.post('/order/submit', orderData)
      if (res.data.code === 200) {
        // 创建新订单对象
        const now = new Date()
        const currentTime = now.toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }).replace(/\//g, '-')
        
        const newOrder = {
          orderId: res.data.data.orderNo || Date.now().toString(),
          orderNo: res.data.data.orderNo,
          createTime: currentTime,
          status: 1,
          items: orderData.items.map(item => ({
            id: Date.now().toString() + Math.random(),
            title: item.product.title,
            thumb: item.product.image,
            price: item.product.price,
            quantity: item.quantity,
            status: 1,
            createTime: currentTime
          }))
        }
        
        // 添加到订单列表开头
        orders.value.unshift(newOrder)
        saveToStorage()
        
        showSuccessToast('下单成功')
        return { success: true, order: newOrder }
      }
    } catch (error) {
      console.error('提交订单失败', error)
      showToast('提交订单失败')
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  // 计算单个订单总价
  const calculateOrderTotal = (items) => {
    return items.reduce((total, item) => {
      return total + (item.price * item.quantity)
    }, 0).toFixed(2)
  }

  // 根据订单ID获取订单
  const getOrderById = (orderId) => {
    return orders.value.find(order => order.orderId === orderId)
  }

  // 更新订单状态
  const updateOrderStatus = (orderId, status) => {
    const order = orders.value.find(order => order.orderId === orderId)
    if (order) {
      order.status = status
      saveToStorage()
    }
  }

  // 删除订单
  const deleteOrder = (orderId) => {
    const index = orders.value.findIndex(order => order.orderId === orderId)
    if (index > -1) {
      orders.value.splice(index, 1)
      saveToStorage()
      showSuccessToast('删除成功')
    }
  }

  // 清空所有订单
  const clearOrders = () => {
    orders.value = []
    localStorage.removeItem('orders')
  }

  // 强制刷新
  const refresh = async () => {
    await fetchOrders(true)
  }

  return {
    orders,
    loading,
    orderCount,
    totalOrderAmount,
    fetchOrders,
    submitOrder,
    calculateOrderTotal,
    getOrderById,
    updateOrderStatus,
    deleteOrder,
    clearOrders,
    refresh
  }
})