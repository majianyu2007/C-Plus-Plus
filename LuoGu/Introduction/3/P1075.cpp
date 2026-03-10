#include <iostream>

using namespace std;

int main(void)
{
    long long n;
    cin >> n;
    
    long long smaller = 0;
    
    for (long long i = 2; i * i <= n; i++) {
        if (n % i == 0) {
            smaller = i;
            break;
        }
    }
    
    long long larger = n / smaller;
    
    cout << larger << endl;
    
    return 0;
}