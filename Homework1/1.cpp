#include <iostream>

using std::cout;
using std::endl;

int main(void)
{
    cout << "a\ta^2\ta^3" << endl;
    for (int a = 1; a <= 4; a++) {
        cout << a << "\t" << a*a << "\t" << a*a*a << endl;
    }
    return 0;
}