#include <iostream>
#include <cmath>

using std::cout;
using std::cin;
using std::endl;
using std::sqrt;

int main(void)
{
    double x1{0.0};
    double y1{0.0};
    double x2{0.0};
    double y2{0.0};
    cin >> x1 >> y1 >> x2 >> y2;

    const double dx = x2 - x1;
    const double dy = y2 - y1;
    const double distance = sqrt(dx * dx + dy * dy);

    cout << distance << endl;

    return 0;
}