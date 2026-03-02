#include <iostream>
#include <iomanip>

using std::cin;
using std::cout;
using std::endl;
using std::setprecision;
using std::fixed;

int main(void)
{
    double total{0};
    int n{0};
    cin >> total >> n;
    cout << fixed << setprecision(3) << double(total / double(n)) << endl;
    cout << n * 2 << endl;

    return 0;
}