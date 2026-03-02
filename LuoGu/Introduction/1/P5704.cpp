#include <iostream>

using std::cin;
using std::cout;
using std::endl;

int main(void)
{
    char ch;
    cin >> ch;
    cout << char(ch - 32) << endl;
    return 0;
}