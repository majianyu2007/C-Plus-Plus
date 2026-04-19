# C++ 代码库完整索引

## 快速导航

本索引帮助你快速找到所需的文档和代码文件。

### 文档导航

| 文档 | 描述 | 大小 | 更新时间 |
|------|------|------|---------|
| [CODE_ANALYSIS_REPORT.md](CODE_ANALYSIS_REPORT.md) | 详细分析报告（30+ 页） | 18K | 2026-04-19 |
| [QUICK_REFERENCE.md](QUICK_REFERENCE.md) | 快速参考指南 | 7.7K | 2026-04-19 |
| [ANALYSIS_SUMMARY.txt](ANALYSIS_SUMMARY.txt) | 总结和统计 | 9.3K | 2026-04-19 |
| [INDEX.md](INDEX.md) | 本文件 - 完整索引 | - | 2026-04-19 |

---

## 代码文件导航

### 高价值代码（优先学习）

#### 数据结构
- **队列**: `/Homework5/1.cpp` - IntQueue (143行) ⭐⭐⭐
  - 功能: FIFO队列，动态扩容
  - 学习点: 动态数组管理，RAII
  
- **栈**: `/Practice/2-2.cpp` - CStack (85行) ⭐⭐
  - 功能: 括号匹配
  - 学习点: 栈操作，括号验证

- **链表和栈**: `/Homework7/2.cpp` - CIntList, CIntStack (75行) ⭐⭐
  - 功能: 基于STL的栈和链表
  - 学习点: STL应用，继承

#### 对象设计
- **形状系统**: `/Homework6/1.cpp` (178行) ⭐⭐⭐
  - 功能: 多态形状系统
  - 学习点: 虚函数、unique_ptr、多态
  - 关键: 4个派生类 (Rectangle, Ellipse, Triangle, Donut)

- **商品系统**: `/Homework9/1.cpp` (172行) ⭐⭐⭐
  - 功能: 电商购物系统
  - 学习点: 继承、dynamic_cast、购物车
  - 关键: 4个商品类 (Book, Magazine, MusicCD, VCD)

- **生命周期演示**: `/20260402/3.cpp` (143行) ⭐⭐⭐
  - 功能: 完整的RAII演示
  - 学习点: 所有拷贝控制成员、移动语义
  - 关键: 委托构造、日志输出

#### 数值计算
- **有理数（高级）**: `/Homework8/1.cpp` (151行) ⭐⭐⭐
  - 功能: 精确有理数计算
  - 学习点: 完整运算符重载、GCD
  - 特色: long long、++/--、流操作符

- **有理数（基础）**: `/Homework4/2.cpp` (140行) ⭐⭐
  - 功能: 基础有理数
  - 学习点: 异常处理、GCD

- **复数类**: `/20260409/2.cpp` (72行) ⭐
  - 功能: 复数运算
  - 学习点: 友元函数

- **高精度**: `/LuoGu/Introduction/3/P1009.cpp` (89行) ⭐⭐
  - 功能: 高精度加法和乘法
  - 学习点: vector存储、逐位运算

#### 几何计算
- **三角形**: `/Practice/3-1.cpp` (57行) ⭐
  - 功能: 周长和面积
  - 学习点: 海伦公式

- **椭球**: `/Practice/2-1.cpp` (56行) ⭐
  - 功能: 体积计算
  - 学习点: 几何类设计

- **长方体**: `/20260409/1.cpp` (81行) ⭐
  - 功能: 长方体比较
  - 学习点: 排序和比较

- **矩形**: `/20260409/3/Sources/src/CRectangle.cpp` (36行)
  - 功能: 矩形计算
  - 学习点: 对角线、周长、面积

#### 系统设计
- **时间类**: `/Homework3/3.cpp` (107行) ⭐⭐
  - 功能: 24/12小时格式
  - 学习点: 数据验证、格式化输出

- **风扇类**: `/Homework4/1.cpp` (122行) ⭐⭐
  - 功能: 风扇状态管理
  - 学习点: const成员、状态格式化

- **学生课程关系**: `/Homework7/3.cpp` (126行) ⭐⭐
  - 功能: 双向多对多关系
  - 学习点: 关系设计、find+erase

---

### 算法实现

#### 排序和搜索
- **冒泡排序**: `/20260409/1.cpp` - `bubble_sort()` [O(n²)]
  - 特色: 模板函数、优化标志
  
- **质数判断**: `/LuoGu/Introduction/5/P1125.cpp` - `isPrime()` [O(√n)]
  - 特色: 6k±1优化

#### 数值算法
- **二进制转换**: `/Chaptar4/4.1.cpp` - `to_bin()` [O(log n)]
  
- **2的幂检验**: `/Chaptar4/4.4.cpp` - 位操作 [O(1)] ⭐
  - 技巧: `(n & (n-1)) == 0`

- **缺失数查找**: `/Chaptar4/4.3.cpp` - 总和法 [O(n)]

- **Fibonacci**: `/LuoGu/Introduction/3/P1720.cpp` - Binet公式 [O(1)]

#### 矩阵操作
- **螺旋矩阵**: `/LuoGu/Introduction/4/P5731.cpp` [O(n²)]
  - 方法: 四边界控制

- **矩阵变换**: `/LuoGu/Introduction/4/P1205.cpp`
  - 旋转: `result[j][n-1-i] = grid[i][j]`
  - 反射: `result[i][j] = grid[i][n-1-j]`

#### 编码和处理
- **RLE编码**: `/LuoGu/Introduction/4/P1320.cpp` - 行程编码

- **大小写转换**: `/LuoGu/Introduction/5/P5733.cpp`

- **字符分类**: `/Chaptar4/4.2.cpp` - isalpha(), isdigit()

#### 游戏论
- **Nim游戏**: `/LuoGu/LanQiaoBei/ByID/P8770_B.cpp`
  - 方法: 递归 + 备忘录 + 状态搜索

---

## 学习路径

### 初级（第1-2周）
```
Homework1/     → 基本类设计
Homework2/     → 数组和字符串
Homework3/     → 时间类（数据验证）
Homework4/1    → 风扇类（常量和状态）
20260402/3     → 完整对象生命周期
```

### 中级（第3-4周）
```
Homework4/2    → 有理数基础
Homework5      → 队列数据结构 ⭐
Homework7/2    → 栈和链表
Practice/2-1   → 椭球类
Practice/3-1   → 三角形类
```

### 高级（第5-6周）
```
Homework6      → 形状系统（多态） ⭐
Homework7/3    → 关系设计 ⭐
Homework8      → 有理数高级 ⭐
Homework9      → 商品系统 ⭐
```

### 进阶（第7周+）
```
Chaptar4/      → 算法技巧
LuoGu/Intro/   → 竞赛问题
LuoGu/LanQiao/ → 蓝桥杯题目
```

---

## 按主题索引

### 对象设计模式
| 主题 | 文件 | 特色 |
|------|------|------|
| 虚函数多态 | Homework6/1.cpp | Shape系统 |
| 继承设计 | Homework9/1.cpp | Goods系统 |
| 双向关系 | Homework7/3.cpp | Student-Course |
| 完整生命周期 | 20260402/3.cpp | 所有拷贝控制 |
| 运算符重载 | Homework8/1.cpp | 有理数 |

### 数据结构
| 结构 | 文件 | 大小 | 特色 |
|------|------|------|------|
| 队列 | Homework5/1.cpp | 143行 | 指针优化 |
| 栈(数组) | Practice/2-2.cpp | 85行 | 动态扩容 |
| 栈(链表) | Homework7/2.cpp | 75行 | STL基础 |
| 链表 | Homework7/2.cpp | 25行 | 双端操作 |

### 算法优化
| 技巧 | 文件 | 复杂度 |
|------|------|--------|
| 位操作 | Chaptar4/4.4.cpp | O(1) |
| 高精度 | LuoGu/.../P1009.cpp | O(n) |
| 矩阵变换 | LuoGu/.../P1205.cpp | O(n²) |
| 螺旋填充 | LuoGu/.../P5731.cpp | O(n²) |
| 质数判断 | LuoGu/.../P1125.cpp | O(√n) |

---

## 关键代码片段速查

### 完整类模板
```cpp
// 参考: 20260402/3.cpp
class MyClass {
  // 默认构造, 带参构造, 拷贝, 移动, 析构
};
```

### 虚函数继承
```cpp
// 参考: Homework6/1.cpp
class Base {
  virtual void method() = 0;
};
```

### 运算符重载
```cpp
// 参考: Homework8/1.cpp
MyClass operator+(const MyClass& rhs);
friend ostream& operator<<(ostream&, const MyClass&);
```

### 动态扩容
```cpp
// 参考: Practice/2-2.cpp
if (isFull()) {
  T* newData = new T[size * 2];
  // ... copy ...
  delete[] data;
  data = newData;
}
```

### 高精度计算
```cpp
// 参考: LuoGu/Introduction/3/P1009.cpp
vector<int> add(vector<int>& a, vector<int>& b) {
  // vector按位存储, 逐位运算 + 进位
}
```

---

## 常见问题查询

### Q: 如何实现队列？
**A**: 参考 `/Homework5/1.cpp` - IntQueue
- 使用vector + front/rear指针
- 动态容量管理（翻倍）

### Q: 如何设计继承结构？
**A**: 参考 `/Homework6/1.cpp` 或 `/Homework9/1.cpp`
- 定义纯虚函数
- 实现虚析构函数
- 使用unique_ptr管理

### Q: 如何重载运算符？
**A**: 参考 `/Homework8/1.cpp` - CRational
- 成员函数：`operator+`, `operator-`
- 友元函数：`operator<<`, `operator>>`

### Q: 如何处理内存安全？
**A**: 参考 `/20260402/3.cpp`
- 使用RAII原则
- 智能指针(unique_ptr)
- 异常处理

### Q: 如何进行几何计算？
**A**: 参考 `/Practice/3-1.cpp`
- 海伦公式计算面积
- 点距离计算

### Q: 如何优化算法？
**A**: 参考 `/Chaptar4/4.4.cpp`
- 位操作: `(n & (n-1)) == 0`
- 时间复杂度分析

---

## 统计数据

- **总文件数**: 170 个
- **总代码行数**: 6388 行
- **高价值文件**: 9 个（>100行的作业）
- **数据结构**: 4 个（队列、栈、链表、几何）
- **算法实现**: 10+ 个
- **设计模式**: 5+ 个

---

## 生成的文档

- [CODE_ANALYSIS_REPORT.md](CODE_ANALYSIS_REPORT.md) - 详细分析
- [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - 快速参考
- [ANALYSIS_SUMMARY.txt](ANALYSIS_SUMMARY.txt) - 总结统计
- [INDEX.md](INDEX.md) - 本文件

---

## 最后更新

- 分析时间: 2026年4月19日
- 分析文件数: 170个
- 分析深度: 代码级别详细分析
- 下一步: 继续添加新代码或优化现有代码

---

**提示**: 使用 Ctrl+F (Cmd+F) 快速搜索本文档内容。
