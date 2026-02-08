#include <iostream>

using std::cin;
using std::cout;
using std::endl;

bool is_leap(int year)
{
    if ((year % 4 == 0 && year % 100 != 0) || year % 400 == 0)
    {
        return true;
    }
    else
    {
        return false;
    }
}

int day(int year, int month)
{
    if (month == 2)
    {
        return is_leap(year) ? 29 : 28;
    }
    else if (month == 4 || month == 6 || month == 9 || month == 11)
    {
        return 30;
    }
    else
    {
        return 31;
    }
}

int main(void)
{
    int year = 0, month = 0;
    cin >> year >> month;
    if (month >= 1 && month <= 12)
    {
        cout << day(year, month) << endl;
    }
    else
    {
        cout << "Invalid Input!" << endl;
    }
    return 0;
}