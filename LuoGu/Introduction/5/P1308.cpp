#include <cctype>
#include <iostream>
#include <string>

using namespace std;

void strtolower(string &str) {
    for (auto it = str.begin(); it < str.end(); ++it) {
        *it = tolower(*it);
    }
}

int main(void) {
    string substr, str;
    cin >> substr;
    getline(cin, str);
    getline(cin, str);
    strtolower(substr);
    strtolower(str);

    int cnt = 0;
    int firstPos = -1;

    int n = static_cast<int>(str.size());
    int i = 0;
    while (i < n) {
        while (i < n && str[i] == ' ')
            ++i;
        if (i >= n)
            break;

        int start = i;
        while (i < n && str[i] != ' ')
            ++i;

        if (str.substr(start, i - start) == substr) {
            ++cnt;
            if (firstPos == -1)
                firstPos = start;
        }
    }

    if (cnt == 0)
        cout << -1;
    else
        cout << cnt << ' ' << firstPos;

    return 0;
}
