#include <algorithm>
#include <iostream>
#include <string>
#include <vector>

using std::cin;
using std::cout;
using std::endl;
using std::string;
using std::vector;

bool isPrime(int n) {
    if (n < 2)
        return false;
    if (n == 2 || n == 3)
        return true;
    if (n % 2 == 0 || n % 3 == 0)
        return false;
    for (int i = 5; i * i <= n; i += 6) {
        if (n % i == 0 || n % (i + 2) == 0)
            return false;
    }
    return true;
}

int main(void) {
    std::ios::sync_with_stdio(false);
    cin.tie(nullptr);

    vector<int> voc(26, 0);
    string str;
    cin >> str;

    for (auto it = str.begin(); it < str.end(); ++it) {
        int id = *it - 'a';
        voc[id]++;
    }
    int maxn = 0;
    int minn = 101;
    for (int cnt : voc) {
        if (cnt == 0)
            continue;
        if (cnt > maxn)
            maxn = cnt;
        if (cnt < minn)
            minn = cnt;
    }
    int diff = maxn - minn;

    if (isPrime(diff)) {
        cout << "Lucky Word" << endl;
        cout << diff << endl;
    } else {
        cout << "No Answer" << endl;
        cout << 0 << endl;
    }
    return 0;
}
