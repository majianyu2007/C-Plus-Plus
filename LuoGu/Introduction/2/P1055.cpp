#include <iostream>
#include <string>

using std::cin;
using std::cout;
using std::endl;
using std::string;

int main(void)
{
    string isbn;
    cin >> isbn;

    string digits;
    for (char c : isbn) {
        if (c != '-') {
            digits += c;
        }
    }

    int sum = 0;
    for (int i = 0; i < 9; i++) {
        sum += (digits[i] - '0') * (i + 1);
    }
    
    int checkDigit = sum % 11;
    char correctCheck = (checkDigit == 10) ? 'X' : (char)('0' + checkDigit);

    char providedCheck = isbn[12];
    
    if (providedCheck == correctCheck) {
        cout << "Right" << endl;
    } else {
        cout << isbn.substr(0, 12) << correctCheck << endl;
    }
    
    return 0;
}