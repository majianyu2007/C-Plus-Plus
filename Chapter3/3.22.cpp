#include <iostream>

using std::cout;
using std::endl;

int main(void)
{
    int n;
    for (n = 1; n * n * n < 12000; n++);
    cout << n - 1 << endl;
    return 0;
}