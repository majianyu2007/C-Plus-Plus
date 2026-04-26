#include <iostream>

using namespace std;

class Rational {
  private:
    int iUp;
    int iDown;

    int Gcd(int l, int r) {
        if (l < 0)
            l = -l;
        if (r < 0)
            r = -r;
        if (l == 0)
            return r == 0 ? 1 : r;
        while (r != 0) {
            int t = l % r;
            l = r;
            r = t;
        }
        return l == 0 ? 1 : l;
    }

    void Reduce() {
        if (iDown == 0)
            return;
        if (iDown < 0) {
            iDown = -iDown;
            iUp = -iUp;
        }
        // 保留 0/x 的分母，贴合题目给出的样例输出。
        if (iUp == 0)
            return;
        int g = Gcd(iUp, iDown);
        iUp /= g;
        iDown /= g;
    }

  public:
    Rational(int up = 0, int down = 1) : iUp(up), iDown(down) { Reduce(); }

    bool operator!() const { return iDown != 0; }

    Rational operator-() const { return Rational(-iUp, iDown); }

    Rational &operator++() {
        iUp += iDown;
        Reduce();
        return *this;
    }

    Rational &operator--() {
        iUp -= iDown;
        Reduce();
        return *this;
    }

    Rational operator++(int) {
        Rational tmp(*this);
        iUp += iDown;
        Reduce();
        return tmp;
    }

    Rational operator--(int) {
        Rational tmp(*this);
        iUp -= iDown;
        Reduce();
        return tmp;
    }

    friend Rational operator+(const Rational &a, const Rational &b) {
        return Rational(a.iUp * b.iDown + b.iUp * a.iDown, a.iDown * b.iDown);
    }

    friend Rational operator-(const Rational &a, const Rational &b) {
        return Rational(a.iUp * b.iDown - b.iUp * a.iDown, a.iDown * b.iDown);
    }

    friend Rational operator*(const Rational &a, const Rational &b) {
        return Rational(a.iUp * b.iUp, a.iDown * b.iDown);
    }

    friend Rational operator/(const Rational &a, const Rational &b) {
        if (b.iUp == 0) {
            cout << "The denominator cannot be zero!" << endl;
            return Rational(a.iUp * b.iDown, 0);
        }
        return Rational(a.iUp * b.iDown, a.iDown * b.iUp);
    }

    friend bool operator<(const Rational &a, const Rational &b) {
        return 1LL * a.iUp * b.iDown < 1LL * b.iUp * a.iDown;
    }

    friend bool operator>(const Rational &a, const Rational &b) {
        return 1LL * a.iUp * b.iDown > 1LL * b.iUp * a.iDown;
    }

    friend bool operator<=(const Rational &a, const Rational &b) { return !(a > b); }

    friend bool operator>=(const Rational &a, const Rational &b) { return !(a < b); }

    friend ostream &operator<<(ostream &out, const Rational &x) {
        if (x.iDown == 0) {
            out << x.iUp << "/" << x.iDown;
            return out;
        }
        if (x.iDown == 1) {
            out << x.iUp;
        } else {
            out << x.iUp << "/" << x.iDown;
        }
        return out;
    }

    friend istream &operator>>(istream &in, Rational &x) {
        int up = 0;
        int down = 1;
        char slash = '/';
        in >> up >> slash >> down;
        x.iUp = up;
        x.iDown = down;
        x.Reduce();
        if (x.iDown == 0) {
            cout << "The denominator cannot be zero!" << endl;
        }
        return in;
    }
};

int main() {
    Rational a;
    Rational b;

    cout << "Input rational a: " << endl;
    cin >> a;
    cout << "Input rational b: " << endl;
    cin >> b;

    if (!a && !b) {
        cout << "a+b: " << (a + b) << endl;
        cout << "a-b: " << (a - b) << endl;
        cout << "a*b: " << (a * b) << endl;
        cout << "a/b: " << (a / b) << endl;
        cout << "-a: " << (-a) << endl;
        cout << "++a: " << (++a) << endl;
        cout << "--a: " << (--a) << endl;
        cout << "a++: " << (a++) << endl;
        cout << "a--: " << (a--) << endl;
        cout << "a>b: " << ((a > b) ? "true" : "false") << endl;
        cout << "a<b: " << ((a < b) ? "true" : "false") << endl;
    }

    return 0;
}
