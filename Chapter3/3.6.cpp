#include <iostream>

using std::cin;
using std::cout;
using std::endl;

int main(void)
{
    int a = 0, b = 0, c = 0;
    cin >> a >> b >> c;
    if (a > 0 && b > 0 && c > 0 && a + b > c && a + c > b && b + c > a)
    {
        cout << a + b + c << endl;
    }
    else
    {
        cout << "Invalid Input!" << endl;
    }
    return 0;
}