#include <cstdlib>
#include <iostream>
#include <numeric>
#include <sstream>
#include <stdexcept>
#include <string>

using namespace std;

class CRational {
  private:
    long long num;
    long long den;

    void normalize() {
        if (den == 0) {
            throw invalid_argument("Denominator cannot be zero");
        }
        if (den < 0) {
            num = -num;
            den = -den;
        }
        long long g = gcd(llabs(num), llabs(den));
        if (g == 0) {
            den = 1;
        } else {
            num /= g;
            den /= g;
        }
    }

  public:
    CRational(long long n = 0, long long d = 1) : num(n), den(d) { normalize(); }

    CRational(double x) {
        const long long base = 1000000;
        num = static_cast<long long>(x * base + (x >= 0 ? 0.5 : -0.5));
        den = base;
        normalize();
    }

    CRational &operator=(double x) {
        const long long base = 1000000;
        num = static_cast<long long>(x * base + (x >= 0 ? 0.5 : -0.5));
        den = base;
        normalize();
        return *this;
    }

    CRational operator+(const CRational &rhs) const {
        return CRational(num * rhs.den + rhs.num * den, den * rhs.den);
    }

    CRational operator-(const CRational &rhs) const {
        return CRational(num * rhs.den - rhs.num * den, den * rhs.den);
    }

    CRational operator*(const CRational &rhs) const {
        return CRational(num * rhs.num, den * rhs.den);
    }

    CRational operator/(const CRational &rhs) const {
        if (rhs.num == 0) {
            throw invalid_argument("Divisor cannot be zero");
        }
        return CRational(num * rhs.den, den * rhs.num);
    }

    CRational &operator++() {
        num += den;
        normalize();
        return *this;
    }

    CRational operator++(int) {
        CRational temp(*this);
        ++(*this);
        return temp;
    }

    CRational operator+() const { return *this; }
    CRational operator-() const { return CRational(-num, den); }

    bool operator>(const CRational &rhs) const { return num * rhs.den > rhs.num * den; }

    bool operator<(const CRational &rhs) const { return num * rhs.den < rhs.num * den; }

    friend ostream &operator<<(ostream &os, const CRational &r) {
        os << r.num;
        if (r.den != 1) {
            os << "/" << r.den;
        }
        return os;
    }

    friend istream &operator>>(istream &is, CRational &r) {
        string token;
        if (!(is >> token)) {
            return is;
        }

        size_t pos = token.find('/');
        if (pos == string::npos) {
            r.num = stoll(token);
            r.den = 1;
        } else {
            long long n = stoll(token.substr(0, pos));
            long long d = stoll(token.substr(pos + 1));
            r.num = n;
            r.den = d;
        }
        r.normalize();
        return is;
    }
};

int main() {
    CRational r1;
    CRational r2(2, 1);
    CRational r3(-3, -4);
    CRational r4(3, -9);
    CRational r5;

    r1 = 3.6;
    r5 = -r4;
    r4++;
    ++r4;

    cout << "r1: " << r1 << endl;
    cout << "r2: " << r2 << endl;
    cout << "r3: " << r3 << endl;
    cout << "r4: " << r4 << endl;
    cout << "r5: " << r5 << endl;

    if (r4 > r2) {
        cout << "r4>r2" << endl;
    } else {
        cout << "r4<r2" << endl;
    }

    cout << "r2+r3: " << (r2 + r3) << endl;
    cout << "r2-r3: " << (r2 - r3) << endl;
    cout << "r2*r3: " << (r2 * r3) << endl;
    cout << "r2/r3: " << (r2 / r3) << endl;
    cout << "r4+r3: " << (r4 + r3) << endl;
    cout << "r4-r3: " << (r4 - r3) << endl;
    cout << "r4*r3: " << (r4 * r3) << endl;
    cout << "r4/r3: " << (r4 / r3) << endl;

    return 0;
}
