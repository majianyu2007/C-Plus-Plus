#include <iostream>
#include <iomanip>
#include <algorithm>

using std::cin;
using std::cout;
using std::endl;
using std::swap;

int main(void)
{
    int a, b, c;
    cin >> a >> b >> c;

    if (a > b) swap(a, b);
    if (b > c) swap(b, c);
    if (a > b) swap(a, b);

    cout << a << " " << b << " " << c << endl;
    return 0;
}
