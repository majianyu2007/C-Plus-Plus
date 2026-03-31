#include <cctype>
#include <iostream>
#include <string>

using std::cin;
using std::cout;
using std::endl;
using std::string;
using std::toupper;

int main(void) {
    std::ios::sync_with_stdio(false);
    cin.tie(nullptr);

    string str;
    cin >> str;

    for (auto it = str.begin(); it < str.end(); ++it) {
        *it = toupper(*it);
    }

    cout << str << endl;

    return 0;
}
