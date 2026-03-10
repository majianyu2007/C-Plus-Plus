#include <iostream>

using namespace std;

int main(void)
{
    int n;
    cin >> n;
    for (int x = 100; x >= 1; x--) {
        int rem = n - 364 * x;
        if (rem > 0 && rem % 1092 == 0) {
            cout << x << endl;
            cout << rem / 1092 << endl;
            return 0;
        }
    }
    return 0;
}
