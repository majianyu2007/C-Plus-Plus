#include <vector>
using namespace std;

// 方法一：6k±1 优化的试除法
// 时间复杂度：O(√n)
// 适用场景：单个数或少量数的质数判断
bool isPrime(int n) {
    if (n < 2) return false;
    if (n == 2 || n == 3) return true;
    if (n % 2 == 0 || n % 3 == 0) return false;
    // 所有质数都可以表示为 6k±1 (k≥1)
    for (int i = 5; i * i <= n; i += 6) {
        if (n % i == 0 || n % (i + 2) == 0) return false;
    }
    return true;
}

// 方法二：埃拉托斯特尼筛法（Sieve of Eratosthenes）
// 时间复杂度：O(n log log n)
// 空间复杂度：O(n)
// 适用场景：需要判断大量数或范围内所有质数时使用
// 返回一个布尔数组，isPrime[i] 表示 i 是否为质数
vector<bool> sieveOfEratosthenes(int n) {
    vector<bool> isPrime(n + 1, true);
    isPrime[0] = isPrime[1] = false;
    
    for (int i = 2; i * i <= n; i++) {
        if (isPrime[i]) {
            for (int j = i * i; j <= n; j += i) {
                isPrime[j] = false;
            }
        }
    }
    
    return isPrime;
}

// 线性筛法（欧拉筛）- 每个合数只被最小质因子筛掉一次
// 时间复杂度：O(n)
// 空间复杂度：O(n)
// 适用场景：需要得到范围内所有质数时，是最优解
// 返回一个质数列表
vector<int> linearSieve(int n) {
    vector<bool> isPrime(n + 1, true);
    vector<int> primes;
    
    for (int i = 2; i <= n; i++) {
        if (isPrime[i]) {
            primes.push_back(i);
        }
        for (int j = 0; j < primes.size() && i * primes[j] <= n; j++) {
            isPrime[i * primes[j]] = false;
            if (i % primes[j] == 0) break;  // 保证每个合数只被最小质因子筛掉
        }
    }
    
    return primes;
}
