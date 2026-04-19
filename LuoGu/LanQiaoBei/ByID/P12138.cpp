#include <iostream>

typedef long long ll;

using namespace std;

bool isPrime(int n) {
    if (n < 2)
        return false;
    if (n == 2 || n == 3)
        return true;
    if (n % 2 == 0 || n % 3 == 0)
        return false;
    // 所有质数都可以表示为 6k±1 (k≥1)
    for (int i = 5; i * i <= n; i += 6) {
        if (n % i == 0 || n % (i + 2) == 0)
            return false;
    }
    return true;
}

int main(void) {
    ll count{0}, i{1};
    while (count != 2025) {
        if (isPrime(i))
            count++;
        i++;
    }

    cout << i - 1 << endl;

    return 0;
}
