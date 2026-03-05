// 引入输入输出流库，用于 cin 和 cout
#include <iostream>
// 引入向量库，用于动态数组 vector
#include <vector>
// 引入算法库，用于 max 函数
#include <algorithm>

// 使用标准命名空间中的特定名称，避免每次都写 std::
using std::cin;    // 标准输入流
using std::cout;   // 标准输出流
using std::endl;   // 换行符
using std::vector; // 动态数组
using std::max;    // 求最大值函数

// 高精度加法函数：计算 a + b
// 参数：a 和 b 都是用 vector 存储的大整数，每个元素存一位数字（从低位到高位）
// 返回值：相加的结果
vector<int> add(vector<int> &a, vector<int> &b) {
    vector<int> res;  // 存储结果
    int carry = 0;    // 进位
    int maxLen = max(a.size(), b.size());  // 取两个数中较长的长度
    
    // 从低位到高位逐位相加，循环条件：i < maxLen 或还有进位
    for (int i = 0; i < maxLen || carry; i++) {
        if (i < a.size()) carry += a[i];  // 如果 a 还有第 i 位，加到 carry
        if (i < b.size()) carry += b[i];  // 如果 b 还有第 i 位，加到 carry
        res.push_back(carry % 10);        // 当前位的结果是 carry 的个位数
        carry /= 10;                      // 更新进位为 carry 的十位数
    }
    
    return res;  // 返回相加结果
}

// 高精度乘法函数：计算 a * k（a 是大整数，k 是普通整数）
// 参数：a 是用 vector 存储的大整数，k 是普通整数
// 返回值：相乘的结果
vector<int> multiply(vector<int> &a, int k) {
    vector<int> res;  // 存储结果
    int carry = 0;    // 进位
    
    // 从低位到高位逐位相乘，循环条件：i < a.size() 或还有进位
    for (int i = 0; i < a.size() || carry; i++) {
        if (i < a.size()) carry += a[i] * k;  // 当前位乘以 k，加到 carry
        res.push_back(carry % 10);            // 当前位的结果是 carry 的个位数
        carry /= 10;                          // 更新进位为 carry 去掉个位后的值
    }
    
    // 去除高位的前导零（例如 0120 变成 120），但至少保留一位
    while (res.size() > 1 && res.back() == 0) {
        res.pop_back();  // 删除最后一个元素（最高位）
    }
    
    return res;  // 返回相乘结果
}

// 打印高精度数字
// 参数：num 是用 vector 存储的大整数（从低位到高位）
void print(vector<int> &num) {
    // 从高位到低位遍历（倒序输出）
    for (int i = num.size() - 1; i >= 0; i--) {
        cout << num[i];  // 输出每一位数字
    }
    cout << endl;  // 输出换行
}

// 主函数
int main(void)
{
    int n;     // 输入的正整数
    cin >> n;  // 读取 n
    
    // 初始化总和为 0（vector(1, 0) 表示创建一个大小为1、值为0的 vector）
    vector<int> sum(1, 0);
    // 初始化阶乘为 1（表示 0! = 1 或 1! = 1）
    vector<int> factorial(1, 1);
    
    // 从 1 到 n 循环计算阶乘和
    for (int i = 1; i <= n; i++) {
        // 计算 i! = (i-1)! * i，利用前一次的阶乘结果
        factorial = multiply(factorial, i);
        // 累加到总和：sum = sum + i!
        sum = add(sum, factorial);
    }
    
    // 打印最终结果
    print(sum);
    
    return 0;  // 程序正常结束
}
