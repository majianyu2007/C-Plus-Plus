#include <iostream>
#include <vector>

using std::cin;
using std::cout;
using std::endl;
using std::vector;

int main(void)
{
    int n;
    cin >> n;

    bool negative = n < 0;
    if (negative) n = -n;

    int reversed = 0;
    while (n > 0) {
        reversed = reversed * 10 + n % 10;
        n /= 10;
    }

    if (negative) reversed = -reversed;
    cout << reversed << endl;
    return 0;
}