#include <iostream>
#include <string>
#include <vector>

using namespace std;

int main(void) {
    const vector<int> map = {1, 1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3, 1,
                             2, 3, 1, 2, 3, 4, 1, 2, 3, 1, 2, 3, 4};
    string s;
    getline(cin, s);

    int ans = 0;
    for (char c : s) {
        if (c == ' ')
            ans += map[0];
        else
            ans += map[c - 'a' + 1];
    }

    cout << ans << endl;

    return 0;
}
