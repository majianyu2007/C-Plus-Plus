#include <iostream>

using std::cin;
using std::cout;
using std::endl;

bool is_leap(int year)
{
    return (year % 4 == 0 && year % 100 != 0) || (year % 400 == 0);
}

int main(void)
{
    int n;
    cin >> n;
    cout << is_leap(n) << endl;
    return 0;
}