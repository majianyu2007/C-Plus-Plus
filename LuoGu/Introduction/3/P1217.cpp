#include <iostream>
#include <string>

using namespace std;

bool isPrime(int n) {
    if (n < 2) return false;
    if (n == 2 || n == 3) return true;
    if (n % 2 == 0 || n % 3 == 0) return false;
    for (int i = 5; i * i <= n; i += 6) {
        if (n % i == 0 || n % (i + 2) == 0) return false;
    }
    return true;
}

int main(void)
{
    int a{0}, b{0};
    cin >> a >> b;
    
    for (int i = a; i <= b; i++) {
        if (i % 2 == 0) {
            continue;
        }
        
        int w = i, s = 0;
        while (w != 0) {
            s = s * 10 + w % 10;
            w /= 10;
        }
        if (s != i) {
            continue;
        }
        
        if (isPrime(i)) {
            cout << i << endl;
        }
    }

    return 0;
}