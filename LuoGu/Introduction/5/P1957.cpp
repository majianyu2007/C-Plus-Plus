#include <iostream>
#include <string>

using std::cin;
using std::cout;
using std::endl;
using std::stoi;
using std::string;
using std::to_string;

int main(void) {
    std::ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int i{0};
    cin >> i;
    char op{};
    for (auto j = 0; j < i; ++j) {
        int num1{0}, num2{0};
        string firstToken;
        cin >> firstToken;
        if (firstToken == "a" || firstToken == "b" || firstToken == "c") {
            op = firstToken[0];
            cin >> num1 >> num2;
        } else {
            num1 = stoi(firstToken);
            cin >> num2;
        }

        int result{};
        char opSymbol{};
        if (op == 'a') {
            result = num1 + num2;
            opSymbol = '+';
        } else if (op == 'b') {
            result = num1 - num2;
            opSymbol = '-';
        } else if (op == 'c') {
            result = num1 * num2;
            opSymbol = '*';
        }

        string equation = to_string(num1) + opSymbol + to_string(num2) + '=' + to_string(result);
        cout << equation << endl;
        cout << equation.length() << endl;
    }

    return 0;
}
