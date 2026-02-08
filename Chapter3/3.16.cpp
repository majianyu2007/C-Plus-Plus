#include <iostream>
#include <cmath>

using std::cout;
using std::endl;
using std::fabs;

int main(void)
{
    double e{1.0};
    double term{1.0};
    for (int n = 1; fabs(term) > 1e-5; ++n)
    {
        term /= n;
        e += term;
    }
    cout << e << endl;

    return 0;
}