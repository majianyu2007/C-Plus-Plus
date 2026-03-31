#include <iostream>
#include <string>
#include <vector>

using std::cin;
using std::cout;
using std::string;
using std::vector;

vector<string> rotate90(const vector<string> &grid) {
    int n = static_cast<int>(grid.size());
    vector<string> result(n, string(n, ' '));
    for (int i = 0; i < n; ++i) {
        for (int j = 0; j < n; ++j) {
            result[j][n - 1 - i] = grid[i][j];
        }
    }
    return result;
}

vector<string> reflectHorizontal(const vector<string> &grid) {
    int n = static_cast<int>(grid.size());
    vector<string> result = grid;
    for (int i = 0; i < n; ++i) {
        for (int j = 0; j < n; ++j) {
            result[i][j] = grid[i][n - 1 - j];
        }
    }
    return result;
}

bool same(const vector<string> &a, const vector<string> &b) { return a == b; }

int main(void) {
    std::ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n = 0;
    cin >> n;
    vector<string> init(n), target(n);
    for (int i = 0; i < n; ++i) {
        cin >> init[i];
    }
    for (int i = 0; i < n; ++i) {
        cin >> target[i];
    }

    vector<string> r90 = rotate90(init);
    if (same(r90, target)) {
        cout << 1 << '\n';
        return 0;
    }

    vector<string> r180 = rotate90(r90);
    if (same(r180, target)) {
        cout << 2 << '\n';
        return 0;
    }

    vector<string> r270 = rotate90(r180);
    if (same(r270, target)) {
        cout << 3 << '\n';
        return 0;
    }

    vector<string> reflected = reflectHorizontal(init);
    if (same(reflected, target)) {
        cout << 4 << '\n';
        return 0;
    }

    vector<string> c1 = rotate90(reflected);
    vector<string> c2 = rotate90(c1);
    vector<string> c3 = rotate90(c2);
    if (same(c1, target) || same(c2, target) || same(c3, target)) {
        cout << 5 << '\n';
        return 0;
    }

    if (same(init, target)) {
        cout << 6 << '\n';
        return 0;
    }

    cout << 7 << '\n';

    return 0;
}
