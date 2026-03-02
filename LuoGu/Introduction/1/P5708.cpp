#include <iostream>
#include <cmath>
#include <iomanip>

using std::cin;
using std::cout;
using std::endl;
using std::sqrt;
using std::fabs;
using std::fixed;
using std::setprecision;

int main(void)
{
    double p{0};
    double a{0}, b{0}, c{0};
    cin >> a >> b >> c;
    p = (a + b + c) / 2.0;
    cout << fixed << setprecision(1) << sqrt(fabs(p * (p - a) * (p - b) * (p - c))) << endl;
    return 0;
}