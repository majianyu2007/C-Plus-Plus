#include <iostream>

using std::cin;
using std::cout;
using std::endl;

int main(void)
{
    int m{0}, t{0}, s{0};
    cin >> m >> t >> s;
    
    int eated{0};
    if (t == 0) {
        eated = (s > 0) ? m : 0;
    } else {
        eated = s / t;
        if (s % t > 0 && eated < m) {
            eated++;
        }
    }
    
    int remain = m - eated;
    if (remain < 0) remain = 0;
    
    cout << remain << endl;
    return 0;
}