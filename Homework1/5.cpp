#include <iostream>

using std::cin;
using std::cout;
using std::endl;

int main(void)
{
    int n;
    cin >> n;

    bool first = true;
    for (int factor = 2; n > 1; factor++) {
        while (n % factor == 0) {
            if (!first) cout << ", ";
            cout << factor;
            first = false;
            n /= factor;
        }
    }
    cout << endl;

    return 0;
}
