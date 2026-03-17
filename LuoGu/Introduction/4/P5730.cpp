#include <iostream>
#include <string>

using std::cin;
using std::cout;
using std::endl;
using std::string;

int main(void)
{
    int n;
    string s;
    cin >> n >> s;

    string patterns[10][5] = {
        {"XXX", "X.X", "X.X", "X.X", "XXX"},  // 0
        {"..X", "..X", "..X", "..X", "..X"},  // 1
        {"XXX", "..X", "XXX", "X..", "XXX"},  // 2
        {"XXX", "..X", "XXX", "..X", "XXX"},  // 3
        {"X.X", "X.X", "XXX", "..X", "..X"},  // 4
        {"XXX", "X..", "XXX", "..X", "XXX"},  // 5
        {"XXX", "X..", "XXX", "X.X", "XXX"},  // 6
        {"XXX", "..X", "..X", "..X", "..X"},  // 7
        {"XXX", "X.X", "XXX", "X.X", "XXX"},  // 8
        {"XXX", "X.X", "XXX", "..X", "XXX"}   // 9
    };

    for (int row = 0; row < 5; row++) {
        for (int i = 0; i < n; i++) {
            if (i > 0) cout << ".";
            int digit = s[i] - '0';
            cout << patterns[digit][row];
        }
        cout << endl;
    }

    return 0;
}