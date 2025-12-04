# URL 过长问题修复说明

## 问题描述

HTTP 431 错误："Request Header Fields Too Large"

当后端返回的数据量很大时，将完整的 JSON 数据通过 URL 参数传递会导致 URL 过长，超过服务器的请求头大小限制。

## 解决方案

使用 **sessionStorage** 存储大数据，URL 中只传递存储键（key），而不是完整数据。

### 修改的文件

1. **`html/judge.html`** - 数据发送端
2. **`html/reason_result.html`** - 数据接收端
3. **`html/search_result.html`** - 数据接收端

### 修改内容

#### 1. judge.html（数据发送端）

**修改前**：
```javascript
const params = new URLSearchParams({
  brand: brand,
  xinghao: xinghao,
  errorid: errorid,
  describe: describe,
  ret: JSON.stringify(ret)  // ❌ 大数据直接放在 URL 中
});
```

**修改后**：
```javascript
// 将大数据存储在 sessionStorage 中
const storageKey = 'qa_result_data_' + Date.now();
sessionStorage.setItem(storageKey, JSON.stringify(ret));
sessionStorage.setItem(storageKey + '_query', JSON.stringify({
  brand: brand,
  xinghao: xinghao,
  errorid: errorid,
  describe: describe
}));

// URL 中只传递存储键
const params = new URLSearchParams({
  brand: brand,
  xinghao: xinghao,
  errorid: errorid,
  describe: describe,
  dataKey: storageKey  // ✅ 只传递存储键
});
```

#### 2. reason_result.html（数据接收端）

**修改前**：
```javascript
function getQueryParams() {
  return {
    ret: params.get('ret')  // ❌ 从 URL 读取大数据
  };
}
abc = params.ret;
res = JSON.parse(abc);
```

**修改后**：
```javascript
function getQueryParams() {
  return {
    dataKey: params.get('dataKey')  // ✅ 从 URL 获取存储键
  };
}

// 从 sessionStorage 读取数据
var abc = null;
if (params.dataKey) {
  var storedData = sessionStorage.getItem(params.dataKey);
  if (storedData) {
    abc = storedData;
  }
}

// 向后兼容：如果没有从 sessionStorage 读取到，尝试从 URL 参数读取
if (!abc) {
  const urlParams = new URLSearchParams(window.location.search);
  abc = urlParams.get('ret');
}

res = JSON.parse(abc);
```

#### 3. search_result.html（数据接收端）

同样的修改逻辑。

## 优势

1. **解决 URL 过长问题**：URL 中只传递小的参数和存储键
2. **向后兼容**：如果 sessionStorage 没有数据，会尝试从 URL 参数读取
3. **性能提升**：避免了大数据在 URL 中的编码/解码开销
4. **更安全**：敏感数据不会暴露在 URL 中

## 注意事项

1. **sessionStorage 限制**：每个域名通常有 5-10MB 的存储限制，但对于单次查询结果足够
2. **浏览器兼容性**：sessionStorage 支持所有现代浏览器
3. **数据清理**：数据会在浏览器标签页关闭时自动清除（sessionStorage 特性）
4. **多个标签页**：每个标签页有独立的 sessionStorage，不会互相干扰

## 测试建议

1. 测试大数据场景：确保大数据能正常存储和读取
2. 测试向后兼容：确保旧的 URL 参数方式仍能工作
3. 测试多个标签页：确保不同标签页的数据不会互相干扰
4. 测试浏览器兼容性：在主要浏览器中测试


