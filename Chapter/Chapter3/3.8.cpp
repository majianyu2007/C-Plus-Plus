#include <iostream>

using std::cin;
using std::cout;
using std::endl;

int main(void)
{
    int a = 0;
    cin >> a;
    if (a >= 0 && a <= 15)
    {
        cout << "The hexadecimal value is: " << std::uppercase << std::hex << a << endl;
    }
    else
    {
        cout << "Invalid Input!" << endl;
    }

    return 0;
}