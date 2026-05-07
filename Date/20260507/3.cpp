#include <iostream>

using namespace std;

template <typename T> void Swap(T &a, T &b) {
    T temp = a;
    a = b;
    b = temp;
}

class CPoint2D {
  private:
    double x;
    double y;

  public:
    CPoint2D(double x = 0.0, double y = 0.0) : x(x), y(y) {}

    CPoint2D(const CPoint2D &other) : x(other.x), y(other.y) {}

    friend ostream &operator<<(ostream &os, const CPoint2D &other) {
        os << "(" << other.x << ", " << other.y << ")";
        return os;
    }

    friend istream &operator>>(istream &is, CPoint2D &other) {
        is >> other.x >> other.y;
        return is;
    }

    CPoint2D &operator=(const CPoint2D &other) {
        if (this != &other) {
            x = other.x;
            y = other.y;
        }
        return *this;
    }
};

int main(void) {
    CPoint2D P1, P2;
    cout << "请输入第一个点的坐标：" << endl;
    cin >> P1;
    cout << "请输入第二个点的坐标：" << endl;
    cin >> P2;
    cout << "点坐标交换前：" << endl;
    cout << "P1:" << P1 << ", " << "P2:" << P2 << endl;
    Swap(P1, P2);
    cout << "点坐标交换后：" << endl;
    cout << "P1:" << P1 << ", " << "P2:" << P2 << endl;
    return 0;
}
