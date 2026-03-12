#include <iostream>
#include <cmath>
#include <iomanip>
#include <algorithm>

using std::cin;
using std::cout;
using std::endl;
using std::fixed;
using std::setprecision;
using std::sort;

class Ellipsoid
{
private:
    double r1, r2, r3;
    double PI = 3.1416;

public:
    Ellipsoid(double radius1 = 1.0, double radius2 = 1.0, double radius3 = 1.0)
        : r1(radius1), r2(radius2), r3(radius3) {}

    void InputRadii()
    {
        cin >> r1 >> r2 >> r3;
    }

    bool IsEqual(const Ellipsoid &other) const
    {
        double a[] = {r1, r2, r3};
        double b[] = {other.r1, other.r2, other.r3};
        sort(a, a + 3);
        sort(b, b + 3);
        return a[0] == b[0] && a[1] == b[1] && a[2] == b[2];
    }

    double GetVolume() const
    {
        return 4 * PI * r1 * r2 * r3 / 3;
    }
    
};

int main(void)
{
    Ellipsoid E1, E2;
    E1.InputRadii();
    E2.InputRadii();

    cout << fixed << setprecision(3);
    cout << E1.GetVolume() << " ";
    cout << E2.GetVolume() << endl;
    cout << (E1.IsEqual(E2) ? "true" : "false") << endl;

    return 0;
}