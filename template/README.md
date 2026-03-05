# C++ 算法模板库

## 高精度算法

用于处理超出基本数据类型范围的大整数运算。

### 数据表示
- 使用 `vector<int>` 存储大整数
- 每个元素存一位数字（0-9）
- **从低位到高位**存储（例如：123 存为 `[3,2,1]`）

### 模板文件

#### 1. [high_precision_add.cpp](high_precision_add.cpp)
- **功能**：高精度加法 (a + b)
- **时间复杂度**：O(max(len_a, len_b))
- **适用场景**：计算两个大整数相加

#### 2. [high_precision_multiply.cpp](high_precision_multiply.cpp)
- **功能**：高精度乘法 (a × k)，其中 a 是大整数，k 是普通整数
- **时间复杂度**：O(len_a)
- **适用场景**：大整数乘以小整数，如阶乘计算

#### 3. [high_precision_print.cpp](high_precision_print.cpp)
- **功能**：打印高精度数字
- **说明**：倒序输出 vector（高位在前）

### 使用示例

```cpp
#include <vector>
using namespace std;

// 初始化：表示数字 123
vector<int> num = {3, 2, 1};  // 低位到高位

// 加法
vector<int> a = {3, 2, 1};  // 123
vector<int> b = {7, 6, 5};  // 567
vector<int> sum = add(a, b);  // 690

// 乘法
vector<int> c = {5, 4, 3};  // 345
vector<int> prod = multiply(c, 2);  // 690

// 打印
print(sum);  // 输出：690
```

### 相关题目
- **洛谷 P1009**：阶乘之和（n ≤ 50）
