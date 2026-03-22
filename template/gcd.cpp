// 最大公约数（GCD）与最小公倍数（LCM）模板
#include <cstdlib>

// 迭代版欧几里得算法
// 时间复杂度：O(log(min(a, b)))
// 适用场景：求两个整数的最大公约数
int gcd(int a, int b) {
    a = std::abs(a);
    b = std::abs(b);
    while (b != 0) {
        int t = a % b;
        a = b;
        b = t;
    }
    return a;
}

// 最小公倍数
// 时间复杂度：O(log(min(a, b)))
// 注意：当 a 或 b 为 0 时，定义 lcm 为 0
int lcm(int a, int b) {
    if (a == 0 || b == 0) return 0;
    return std::abs(a / gcd(a, b) * b);
}