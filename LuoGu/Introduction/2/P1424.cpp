#include <iostream>

using std::cin;
using std::cout;
using std::endl;

int main(void)
{
    int x, n;
    cin >> x >> n;
    
    int total = 0;
    int day = x;
    
    for (int i = 0; i < n; i++) {
        if (day >= 1 && day <= 5) {
            total += 250;
        }

        day++;
        if (day > 7) {
            day = 1;
        }
    }
    
    cout << total << endl;
    return 0;
}