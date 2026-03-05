#include <iostream>

using std::cin;
using std::cout;
using std::endl;

int main(void)
{
    int k{0};
    cin >> k;
    int n{1};
    double sn{1.0};
    while(sn <= k)
    {
        sn += 1 / (double)++n;
    }
    cout << n << endl;
    return 0;
}