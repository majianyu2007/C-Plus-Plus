#include <iostream>

using std::cin;
using std::cout;
using std::endl;

int main(void)
{
    int y, m;
    cin >> y >> m;
    
    bool isLeap = (y % 400 == 0) || (y % 100 != 0 && y % 4 == 0);
    
    int days[] = {0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31};
    
    if (m == 2 && isLeap) {
        cout << 29 << endl;
    } else {
        cout << days[m] << endl;
    }
    
    return 0;
}