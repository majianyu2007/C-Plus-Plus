#include <iostream>
#include <string>

using std::cin;
using std::cout;
using std::endl;
using std::string;

int main(void) {
    std::ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n{0};
    cin >> n;
    string str;
    cin >> str;

    for (auto it = str.begin(); it < str.end(); ++it) {
        *it = 'a' + (*it - 'a' + n) % 26;
    }

    cout << str << endl;

    return 0;
}
