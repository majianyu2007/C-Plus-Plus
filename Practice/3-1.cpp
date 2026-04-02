#include <cmath>
#include <iomanip>
#include <iostream>

using std::cin;
using std::cout;
using std::endl;
using std::setprecision;

class CPoint {
  private:
    double x;
    double y;

  public:
    CPoint(double x = 0.0, double y = 0.0) : x(x), y(y) {}

    double DistanceTo(const CPoint &other) const {
        const double dx = x - other.x;
        const double dy = y - other.y;
        return std::sqrt(dx * dx + dy * dy);
    }
};

class CTriangle {
  private:
    CPoint a;
    CPoint b;
    CPoint c;

  public:
    CTriangle(const CPoint &a, const CPoint &b, const CPoint &c) : a(a), b(b), c(c) {}

    double Perimeter() const { return a.DistanceTo(b) + b.DistanceTo(c) + c.DistanceTo(a); }

    double Area() const {
        const double ab = a.DistanceTo(b);
        const double bc = b.DistanceTo(c);
        const double ca = c.DistanceTo(a);
        const double p = (ab + bc + ca) / 2.0;
        const double area2 = p * (p - ab) * (p - bc) * (p - ca);
        return std::sqrt(std::fmax(area2, 0.0));
    }
};

int main() {
    double x1, y1, x2, y2, x3, y3;
    cin >> x1 >> y1 >> x2 >> y2 >> x3 >> y3;

    const CPoint p1(x1, y1);
    const CPoint p2(x2, y2);
    const CPoint p3(x3, y3);
    const CTriangle triangle(p1, p2, p3);

    cout << setprecision(10) << triangle.Perimeter() << " " << triangle.Area() << endl;
    return 0;
}
