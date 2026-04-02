#include <iostream>
#include <cmath>

const double PI = 3.1416;

using std::cin;
using std::cout;
using std::endl;
using std::sqrt;

double Area(double r)
{
    return PI * r * r;
}

double Area(double len, double wid)
{
    return len * wid;
}

double Area(double a, double b, double c)
{
    double p = (a + b + c) / 2;
    return sqrt(p*(p-a)*(p-b)*(p-c));
}

int main(void)
{
    double r{0.0}, len{0.0}, wid{0.0}, a{0.0}, b{0.0}, c{0.0};
    cin >> r >> len >> wid >> a >> b >> c;
    cout << Area(r) << endl;
    cout << Area(len, wid) << endl;
    cout << Area(a, b, c) << endl;
    return 0;
}