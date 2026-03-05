// 高精度加法模板
#include <vector>
#include <algorithm>
using std::vector;
using std::max;

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
