# C++ 算法模板库

从 170+ 文件中精选出的高价值代码模板。包含 OOP 设计、数据结构、算法优化等核心内容。

## 📦 核心模板文件（5个）

### 1. OOP_design_patterns.cpp (8.3 KB)
- **Shape 虚函数多态继承体系** - 完整的 OOP 设计示例
- **DynamicResource 深拷贝管理** - 拷贝构造、赋值、移动语义
- **ShapeManager 智能指针管理** - unique_ptr 自动内存管理
- **异常处理与设计模式** - 异常安全性保证

**关键类：** Shape, Rectangle, Circle, DynamicResource, ShapeManager, ValidatedData, DataProcessor

**用途：** 多态系统设计、继承层次规划、内存管理实践

### 2. data_structures.cpp (7.6 KB)
- **Queue** - 先进先出 (enqueue/dequeue, O(1))
- **Stack** - 后进先出 (push/pop, O(1))
- **LinkedList** - 双向链表 (push_front/pop_front, O(1)~O(n))

**动态扩容机制、异常处理、STL 风格接口**

**用途：** BFS/DFS 算法、任务调度、括号匹配

### 3. numeric_types.cpp (10 KB)
- **Rational** - 精确有理数 (自动化简、完整运算符重载, O(log n))
- **Complex** - 复数 (四则运算、共轭、模, O(1))
- **BigInteger** - 高精度计算 (加法、乘法, O(n))

**用途：** 精确分数计算、复数运算、大数处理

### 4. geometry_classes.cpp (10 KB)
- **Point** - 点类 (距离、中点计算)
- **Triangle** - 三角形 (海伦公式、内外切圆)
- **Circle** - 圆 (面积、周长、点包含判定)
- **Rectangle** - 矩形 (面积、对角线、顶点)
- **Ellipsoid** - 椭球 (体积、表面积)
- **Cuboid** - 长方体 (相等性判断、体积)

**用途：** 计算几何、物理模拟、碰撞检测

### 5. algorithm_tricks.cpp (11 KB)
- **BitTricks** - 位操作 (isPowerOfTwo, lowestSetBit, countSetBits, O(1))
- **MatrixTransform** - 矩阵变换 (旋转、翻转、转置, O(n²))
- **MathTricks** - 数学技巧 (缺失数、不进位加法、质数判断)
- **GameTheory** - 游戏论与状态搜索 (Nim 游戏、备忘录)
- **SortingTricks** - 排序与查找 (冒泡排序、二分查找)

**用途：** 竞赛编程、性能优化、算法设计

## 🛠 辅助文件

| 文件 | 功能 | 复杂度 |
|------|------|--------|
| prime.cpp | 质数判断 (3种方法) | O(√n) ~ O(n) |
| gcd.cpp | GCD/LCM 计算 | O(log n) |
| Binary_Search.cpp | 二分查找 | O(log n) |
| high_precision_add.cpp | 高精度加法 | O(n) |
| high_precision_multiply.cpp | 高精度乘法 | O(n) |
| high_precision_print.cpp | 高精度打印 | O(n) |

## 🎯 快速查找

### 按需求查找

| 需求 | 文件 | 类/函数 |
|------|------|--------|
| 实现队列 | data_structures.cpp | Queue |
| 实现栈 | data_structures.cpp | Stack |
| 多态系统 | OOP_design_patterns.cpp | Shape 体系 |
| 精确分数 | numeric_types.cpp | Rational |
| 复数计算 | numeric_types.cpp | Complex |
| 三角形面积 | geometry_classes.cpp | Triangle::area() |
| 长方体比较 | geometry_classes.cpp | Cuboid::isEqual() |
| 位操作优化 | algorithm_tricks.cpp | BitTricks |
| 矩阵变换 | algorithm_tricks.cpp | MatrixTransform |
| 检查2的幂 | algorithm_tricks.cpp | BitTricks::isPowerOfTwo() |
| 质数判断 | prime.cpp / algorithm_tricks.cpp | isPrime() |
| 大数阶乘 | numeric_types.cpp | BigInteger::multiply() |

## 📖 学习路线

### 初级（Week 1-2）
1. geometry_classes.cpp → Point & Triangle
2. data_structures.cpp → Queue & Stack
3. algorithm_tricks.cpp → BitTricks 基础

### 中级（Week 3-4）
1. OOP_design_patterns.cpp → 完整阅读
2. numeric_types.cpp → Rational & Complex
3. algorithm_tricks.cpp → MatrixTransform

### 高级（Week 5-6）
1. numeric_types.cpp → BigInteger 深入
2. algorithm_tricks.cpp → GameTheory 应用
3. 综合竞赛题实践

## 🚀 使用方法

### 快速开始

```cpp
#include <iostream>
using namespace std;

// 复制需要的类定义（如 Rational）到你的代码文件

int main() {
    Rational r1(3, 4);
    Rational r2(1, 2);
    
    cout << r1 << " + " << r2 << " = " << (r1 + r2) << endl;
    // 输出：3/4 + 1/2 = 5/4
    
    return 0;
}
```

### 编译命令

```bash
# 编译单个模板的示例代码
g++ -std=c++11 OOP_design_patterns.cpp -o demo
./demo

# 使用模板到你的项目
g++ -std=c++11 your_project.cpp -o output
```

## 💡 常见问题

**Q: 如何在项目中使用这些模板？**
A: 直接复制需要的类定义到你的代码文件，或放入单独的头文件中。

**Q: 代码是否有依赖？**
A: 没有。所有模板仅使用 STL（标准库），无任何外部依赖。

**Q: 支持哪个 C++ 版本？**
A: C++11 及以上。推荐使用 C++11 或 C++14。

**Q: 如何理解时间复杂度？**
A: 
- O(1)：常数时间（最快）
- O(log n)：对数时间（二分查找）
- O(n)：线性时间（遍历数组）
- O(n²)：平方时间（冒泡排序）

## 📊 库内容统计

- **总代码行数：** 2013 行（5 个核心文件）
- **总文件大小：** 108 KB
- **类总数：** 20+ 个
- **函数总数：** 50+ 个

## 📚 文件目录

```
template/
├── OOP_design_patterns.cpp       ⭐ 虚函数、多态、智能指针
├── data_structures.cpp            ⭐ 队列、栈、链表
├── numeric_types.cpp              ⭐ 有理数、复数、高精度
├── geometry_classes.cpp           ⭐ 几何类（平面&立体）
├── algorithm_tricks.cpp           ⭐ 位操作、矩阵变换、算法优化
├── prime.cpp                      质数判断
├── gcd.cpp                        GCD/LCM
├── Binary_Search.cpp              二分查找
├── high_precision_add.cpp         高精度加法
├── high_precision_multiply.cpp    高精度乘法
├── high_precision_print.cpp       高精度打印
└── README.md                      本文件
```

## ✨ 特色

- ✓ 生产级代码质量
- ✓ 完整的错误处理和异常安全性
- ✓ 详尽的代码注释
- ✓ 每个文件都包含使用示例
- ✓ 无外部依赖，开箱即用
- ✓ 从真实项目中提取的高价值代码

## 🎓 预期学习成果

完成此库学习后，你将掌握：
- ✓ 30+ 个高频算法和数据结构
- ✓ 完整的 C++ OOP 实践
- ✓ 智能指针和异常处理
- ✓ 运算符重载的应用
- ✓ 竞赛编程常用模板
- ✓ 性能优化的具体技巧

---

版本：v1.0 | 更新：2026-04-19 | 状态：完整可用
