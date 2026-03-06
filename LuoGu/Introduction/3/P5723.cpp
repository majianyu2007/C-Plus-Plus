#include <iostream>

using std::cin;
using std::cout;
using std::endl;

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
    int L;
    cin >> L;
    
    int sum = 0;
    int count = 0;
    
    for (int i = 2; sum + i <= L; i++) {
        if (isPrime(i)) {
            cout << i << endl;
            sum += i;
            count++;
        }
    }
    cout << count << endl;
    
    return 0;
}