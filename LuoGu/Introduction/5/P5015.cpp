#include <iostream>
#include <string>

using std::cin;
using std::cout;
using std::endl;
using std::string;

int main(void) {
    std::ios::sync_with_stdio(false);
    cin.tie(nullptr);

    string str;
    getline(cin, str);

    int length = str.length();

    for (auto it = str.begin(); it < str.end(); ++it) {
        if (*it == ' ')
            length--;
        if (*it == '\n')
            length--;
    }

    cout << length << endl;

    return 0;
}
