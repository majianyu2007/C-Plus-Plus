#include <iostream>

using std::cin;
using std::cout;
using std::endl;

#define PI 3.14
#define TOTAL 20

int main(void)
{
    int h{0}, r{0};
    cin >> h >> r;
    double litre{0};
    int n{0};
    for(; litre < TOTAL; n++)
    {
        litre += PI * r * r * h * 0.001;
    }
    cout << n << endl;

    return 0;
}