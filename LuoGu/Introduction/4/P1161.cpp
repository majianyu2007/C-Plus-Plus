#include <iostream>
#include <vector>

using std::cin;
using std::cout;
using std::endl;
using std::vector;

int main(void) {
    std::ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n{0};
    cin >> n;
    vector<bool> status(2000000, false);
    for (auto i = 0; i < n; ++i) {
        double a{0};
        int t{0};
        cin >> a >> t;
        for (auto j = 1; j <= t; ++j) {
            status[(int)(j * a)] = !status[(int)(j * a)];
        }
    }
    for (auto k = 0; k < 2000000; ++k) {
        if (status[k])
            cout << k << endl;
    }

    return 0;
}
