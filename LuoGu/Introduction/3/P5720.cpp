#include <iostream>

using std::cin;
using std::cout;
using std::endl;

int main() {
    long long a;
    cin >> a;
    
    int day = 1;
    while (a > 1) {
        a /= 2;
        day++;
    }
    
    cout << day << endl;
    
    return 0;
}