#include <iostream>
#include <cmath>

using std::cin;
using std::cout;
using std::endl;

int main(void)
{
    const double fee = 5000.00;

    // Section 1
    cout << "十年后的学费:" << fee * pow(1.05, 10) << endl;

    // Section 2
    double total_fee = 0;
    // total_fee = fee * pow(1.05, 4) + fee * pow(1.05, 3) + fee * pow(1.05, 2) + fee * pow(1.05, 1);
    for (int i = 0; i < 4; ++i)
        total_fee += fee * pow(1.05, 4 - i);
    cout << "四年共交的学费:" << total_fee << endl;

    // Section 3
    int year = 0;
    double current = fee;
    while (current < 2 * fee) {
        current *= 1.05;
        ++year;
    }
    cout << "学费翻倍需要的年数:" << year << endl;

    return 0;
}