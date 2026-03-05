// 高精度乘法模板（大整数乘以普通整数）
#include <vector>
using std::vector;

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
