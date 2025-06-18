import Mock from 'mockjs'

// 模拟商品分类数据
const categories = [
  { id: 1, name: '餐饮美食', icon: '/icons/餐饮美食.svg' },
  { id: 2, name: '乳品烘焙', icon: '/icons/乳品烘焙.svg' },
  { id: 3, name: '美妆百货', icon: '/icons/美妆百货.svg' },
  { id: 4, name: '酒水饮料', icon: '/icons/酒水饮料.svg' },
  { id: 5, name: '粮油调味', icon: '/icons/粮油调味.svg' },
  { id: 6, name: '冰品面点', icon: '/icons/冰品面点.svg' },
  { id: 7, name: '海鲜水产', icon: '/icons/海鲜水产.svg' },
  { id: 8, name: '肉禽蛋品', icon: '/icons/肉禽蛋品.svg' },
  { id: 9, name: '新鲜蔬菜', icon: '/icons/新鲜蔬菜.svg' },
  { id: 10, name: '时令水果', icon: '/icons/时令水果.svg' }
]

// 模拟轮播图数据
const banners = [
  { id: 1, image: 'https://img01.yzcdn.cn/vant/apple-1.jpg', url: '#' },
  { id: 2, image: 'https://img01.yzcdn.cn/vant/apple-2.jpg', url: '#' },
  { id: 3, image: 'https://img01.yzcdn.cn/vant/apple-3.jpg', url: '#' }
]

// 模拟商品数据
const products = Mock.mock({
    'list|30': [{
        'id|+1': 1,                      // 自增 ID，从 1 开始
        'title': '@ctitle(5, 10)',       // 随机生成 5-10 个汉字的中文标题
        'price|1-100.1-2': 1,           // 随机价格（1-100，小数点后 1-2 位）
        'image': 'https://img01.yzcdn.cn/vant/ipad.jpeg', // 固定图片 URL
        'category_id|1-10': 1,          // 随机分类 ID（1-10 的整数）
        'sales|30-500': 30,             // 随机销量（30-500 的整数）
        'stock|10-100': 10,             // 随机库存（10-100 的整数）
        'description': '@cparagraph(1, 3)' // 随机生成 1-3 段中文描述
    }]
}).list; // 最终提取 `list` 数组赋值给 `products`

// 初始化购物车数据
let cartItems = []

// ==================== 商品相关接口 ====================

// 模拟搜索接口
Mock.mock(/\/api\/search/, 'get', (options) => {
  const url = new URL(options.url, 'http://example.com')
  const keyword = url.searchParams.get('keyword') || ''
  
  if (!keyword) {
    return {
      code: 200,
      data: products.slice(0, 10),
      message: '获取成功'
    }
  }
  
  const filteredProducts = products.filter(item => 
    item.title.includes(keyword)
  )
  
  return {
    code: 200,
    data: filteredProducts,
    message: '搜索成功'
  }
})

// 模拟获取分类接口
Mock.mock('/api/categories', 'get', {
  code: 200,
  data: categories,
  message: '获取成功'
})

// 模拟获取轮播图接口
Mock.mock('/api/banners', 'get', {
  code: 200,
  data: banners,
  message: '获取成功'
})

// 模拟获取商品列表接口
Mock.mock('/api/products', 'get', {
  code: 200,
  data: products,
  message: '获取成功'
})

// 模拟获取商品详情接口
Mock.mock(/\/api\/products\/\d+/, 'get', (options) => {
  const id = parseInt(options.url.match(/\/api\/products\/(\d+)/)[1])
  const product = products.find(item => item.id === id)
  
  if (product) {
    return {
      code: 200,
      data: product,
      message: '获取成功'
    }
  } else {
    return {
      code: 404,
      data: null,
      message: '商品不存在'
    }
  }
})

// ==================== 购物车相关接口 ====================

// 模拟添加到购物车接口
Mock.mock('/api/cart/add', 'post', (options) => {
  const { productId, quantity } = JSON.parse(options.body)
  const product = products.find(item => item.id === productId);
  
  if (!product) {
    return {
      code: 404,
      message: '商品不存在'
    }
  }
  
  // 检查购物车中是否已存在该商品
  const existingItem = cartItems.find(item => item.productId === productId);
  
  if (existingItem) {
    // 如果已存在，更新数量
    existingItem.quantity += quantity;
    return {
      code: 200,
      data: existingItem,
      message: '添加成功'
    }
  } else {
    // 如果不存在，添加新项
    const newItem = {
      id: Mock.Random.guid(),
      productId,
      product,
      quantity,
      selected: true
    };
    cartItems.push(newItem);
    return {
      code: 200,
      data: newItem,
      message: '添加成功'
    }
  }
})

// 获取购物车列表
Mock.mock('/api/cart', 'get', () => {
  return {
    code: 200,
    data: cartItems,
    message: '获取成功'
  }
})

// 更新购物车商品数量
Mock.mock(/\/api\/cart\/update/, 'post', (options) => {
  const { id, quantity } = JSON.parse(options.body)
  const item = cartItems.find(item => item.id === id)
  
  if (item) {
    item.quantity = quantity
    return {
      code: 200,
      data: item,
      message: '更新成功'
    }
  } else {
    return {
      code: 404,
      message: '购物车商品不存在'
    }
  }
})

// 更新购物车商品选中状态
Mock.mock('/api/cart/select', 'post', (options) => {
  const { id, selected } = JSON.parse(options.body)
  
  if (id === 'all') {
    // 全选/取消全选
    cartItems.forEach(item => item.selected = selected)
    return {
      code: 200,
      data: cartItems,
      message: '更新成功'
    }
  } else {
    const item = cartItems.find(item => item.id === id)
    if (item) {
      item.selected = selected
      return {
        code: 200,
        data: item,
        message: '更新成功'
      }
    } else {
      return {
        code: 404,
        message: '购物车商品不存在'
      }
    }
  }
})

// 从购物车中删除商品
Mock.mock('/api/cart/remove', 'post', (options) => {
  const { id } = JSON.parse(options.body)
  const index = cartItems.findIndex(item => item.id === id)
  
  if (index !== -1) {
    cartItems.splice(index, 1)
    return {
      code: 200,
      message: '删除成功'
    }
  } else {
    return {
      code: 404,
      message: '购物车商品不存在'
    }
  }
})

// 结算接口
Mock.mock('/api/cart/checkout', 'post', (options) => {
  const selectedItems = cartItems.filter(item => item.selected)
  const totalAmount = selectedItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  
  // 模拟结算后清空已选商品
  cartItems = cartItems.filter(item => !item.selected)
  
  return {
    code: 200,
    data: {
      orderNo: Mock.Random.string('number', 16),
      totalAmount,
      items: selectedItems
    },
    message: '结算成功'
  }
})

// ==================== 地址相关接口 ====================

// 地址数据
Mock.mock('/api/addresses', 'get', {
  code: 200,
  data: [
    {
      id: 1,
      name: '张三',
      phone: '13800138000',
      province: '广东省',
      city: '深圳市',
      county: '南山区',
      addressDetail: '科技园南路XX号XX大厦',
      isDefault: true
    },
    {
      id: 2,
      name: '李四',
      phone: '13900139000',
      province: '北京市',
      city: '北京市',
      county: '朝阳区',
      addressDetail: 'XX路XX号',
      isDefault: false
    }
  ]
})

// ==================== 用户相关接口 ====================

// 模拟检查登录状态API
Mock.mock('/api/user/check-login', 'get', () => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  return {
    code: 200,
    message: '获取成功',
    data: {
      isLoggedIn
    }
  };
});

// 模拟登录验证API
Mock.mock('/api/user/check-login', 'post', (options) => {
  const { username, password } = JSON.parse(options.body);
  
  // 从localStorage获取已注册用户列表
  const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
  
  // 检查用户是否存在
  const userExists = registeredUsers.some(user => 
    user.username === username && user.password === password
  );
  
  return {
    code: userExists ? 200 : 400,
    message: userExists ? '登录成功' : '用户名或密码错误，或该用户未注册'
  };
});

// 模拟获取用户信息API
Mock.mock('/api/user/info', 'get', () => {
  const userInfoStr = localStorage.getItem('userInfo');
  const userInfo = userInfoStr ? JSON.parse(userInfoStr) : {};
  return {
    code: 200,
    message: '获取成功',
    data: userInfo
  };
});

// 模拟检查昵称API
Mock.mock('/api/user/check-nickname', 'post', (options) => {
  const { nickname } = JSON.parse(options.body);
  // 模拟昵称检查逻辑，这里简单判断昵称长度
  if (nickname.length < 1) {
    return {
      code: 400,
      message: '昵称长度不能少于1个字符'
    };
  }
  return {
    code: 200,
    message: '昵称可用'
  };
});

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

// 模拟更新用户信息API
Mock.mock('/api/user/update', 'post', (options) => {
  const body = JSON.parse(options.body);
  const userInfoStr = localStorage.getItem('userInfo');
  let userInfo = userInfoStr ? JSON.parse(userInfoStr) : {};
  
  // 更新用户信息
  userInfo = { ...userInfo, ...body };
  localStorage.setItem('userInfo', JSON.stringify(userInfo));
  
  return {
    code: 200,
    message: '更新成功',
    data: userInfo
  };
});

// 模拟上传头像API
Mock.mock('/api/user/upload-avatar', 'post', () => {
  // 模拟返回一个随机头像URL
  const avatarUrl = `https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg?t=${Date.now()}`;
  
  // 更新本地存储中的头像
  const userInfoStr = localStorage.getItem('userInfo');
  let userInfo = userInfoStr ? JSON.parse(userInfoStr) : {};
  userInfo.avatar = avatarUrl;
  localStorage.setItem('userInfo', JSON.stringify(userInfo));
  
  return {
    code: 200,
    message: '上传成功',
    data: {
      url: avatarUrl
    }
  };
});

// 模拟注册请求
Mock.mock('/api/user/register', 'post', (options) => {
  const values = JSON.parse(options.body);
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

// ==================== 订单相关接口 ====================

// 模拟获取订单数据
Mock.mock('/api/orders', 'get', () => {
  // 从localStorage中获取订单数据
  const ordersList = JSON.parse(localStorage.getItem('orders')) || [];
  
  return {
    code: 200,
    data: ordersList.length > 0 ? ordersList : [
      // 如果localStorage中没有订单数据，则返回默认的示例订单
      {
        id: Mock.Random.guid(),
        title: '羊排 1000g',
        thumb: 'https://fastly.jsdelivr.net/npm/@vant/assets/ipad.jpeg',
        price: 120.00,
        quantity: 2,
        status: 1,
        createTime: Mock.Random.datetime()
      },
      {
        id: Mock.Random.guid(),
        title: '猪瘦肉',
        thumb: 'https://fastly.jsdelivr.net/npm/@vant/assets/apple-1.jpeg',
        price: 80.00,
        quantity: 4,
        status: 2,
        createTime: Mock.Random.datetime()
      },
      {
        id: Mock.Random.guid(),
        title: '龙虾',
        thumb: 'https://fastly.jsdelivr.net/npm/@vant/assets/apple-2.jpeg',
        price: 160.00,
        quantity: 3,
        status: 3,
        createTime: Mock.Random.datetime()
      }
    ]
  };
});

// 模拟提交订单API
Mock.mock('/api/order/submit', 'post', (options) => {
  const { addressId, items } = JSON.parse(options.body);
  
  // 获取购物车中的商品详情
  const orderItems = items.map(item => {
    const cartItem = cartItems.find(cartItem => cartItem.id === item.id);
    if (!cartItem) return null;
    
    return {
      id: Mock.Random.guid(),
      title: cartItem.product.title,
      thumb: cartItem.product.image,
      price: cartItem.product.price,
      quantity: cartItem.quantity,
      status: 1, // 1: 待发货
      createTime: Mock.Random.datetime()
    };
  }).filter(Boolean); // 过滤掉null值
  
  // 获取现有订单列表或创建新的空数组
  let ordersList = JSON.parse(localStorage.getItem('orders')) || [];
  
  // 将新订单添加到订单列表
  ordersList = [...orderItems, ...ordersList];
  
  // 保存更新后的订单列表
  localStorage.setItem('orders', JSON.stringify(ordersList));
  
  // 从购物车中移除已下单的商品
  items.forEach(item => {
    const index = cartItems.findIndex(cartItem => cartItem.id === item.id);
    if (index !== -1) {
      cartItems.splice(index, 1);
    }
  });
  
  return {
    code: 200,
    data: {
      orderNo: Mock.Random.string('number', 16),
      orderItems
    },
    message: '下单成功'
  };
});

export default Mock