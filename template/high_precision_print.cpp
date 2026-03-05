// 高精度打印模板
#include <iostream>
#include <vector>
using std::cout;
using std::endl;
using std::vector;

// 打印高精度数字
// 参数：num 是用 vector 存储的大整数（从低位到高位）
void print(vector<int> &num) {
    // 从高位到低位遍历（倒序输出）
    for (int i = num.size() - 1; i >= 0; i--) {
        cout << num[i];  // 输出每一位数字
    }
    cout << endl;  // 输出换行
}
