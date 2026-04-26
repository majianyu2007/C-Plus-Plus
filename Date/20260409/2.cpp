#include <iostream>

using std::cin;
using std::cout;
using std::endl;

class Complex {
  private:
    double real, image;

  public:
    Complex(double r = 0, double i = 0) : real(r), image(i) {}

    void show() const {
        cout << real;
        if (image >= 0) {
            cout << "+";
        }
        cout << image << "i" << endl;
    }

    Complex Add(const Complex &c) const { return Complex(real + c.real, image + c.image); }

    Complex Sub(const Complex &c) const { return Complex(real - c.real, image - c.image); }

    friend Complex friendAdd(const Complex &c1, const Complex &c2);
    friend Complex friendSub(const Complex &c1, const Complex &c2);
};

Complex friendAdd(const Complex &c1, const Complex &c2) {
    return Complex(c1.real + c2.real, c1.image + c2.image);
}

Complex friendSub(const Complex &c1, const Complex &c2) {
    return Complex(c1.real - c2.real, c1.image - c2.image);
}

int main(void) {
    std::ios::sync_with_stdio(false);
    cin.tie(nullptr);
    Complex c1(2, 1), c2(6, -2), c3(-2, -1);
    cout << "c1 = ";
    c1.show();
    cout << "c2 = ";
    c2.show();
    cout << "c3 = ";
    c3.show();

    cout << "\n使用成员函数" << endl;
    Complex c4 = c1.Add(c2);
    cout << "c4 = c1+c2 = ";
    c4.show();
    Complex c5 = c1.Sub(c2);
    cout << "c5 = c1-c2 = ";
    c5.show();
    cout << "c6 = c1+c3 = ";
    Complex c6 = c1.Add(c3);
    c6.show();

    cout << "\n使用友元函数" << endl;
    Complex c7 = friendAdd(c1, c2);
    cout << "c7 = friendAdd(c1,c2) = ";
    c7.show();
    Complex c8 = friendSub(c1, c2);
    cout << "c8 = friendSub(c1,c2) = ";
    c8.show();
    Complex c9 = friendAdd(c1, c3);
    cout << "c9 = friendAdd(c1,c3) = ";
    c9.show();

    return 0;
}
