#include <iostream>

typedef long long ll;
using namespace std;

int main(void) {
    const ll MOD = 1e9 + 7;
    const ll exponent = 2022;

    // Calculate 2^2022 mod (10^9 + 7) using fast exponentiation
    ll result = 1;
    ll base = 2;
    ll exp = exponent;

    while (exp > 0) {
        if (exp % 2 == 1) {
            result = (result * base) % MOD;
        }
        base = (base * base) % MOD;
        exp /= 2;
    }

    cout << result << endl;
    return 0;
}
