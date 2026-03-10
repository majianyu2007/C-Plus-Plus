#include <iostream>
#include <iomanip>

using std::cin;
using std::cout;
using std::endl;
using std::setw;
using std::setfill;

int main(void)
{
    int n{0}, num{0};
    cin >> n;

    for (int i = 0; i < n; ++i)
    {
        for (int j = 0; j < n; ++j)
        {
            cout << setw(2) << setfill('0') << ++num;
        }
        cout << endl;
    }
    cout << endl;
    num = 0;
    for (int i = 0; i < n; ++i)
    {
        for (int j = 0; j < n - i - 1; ++j)
        {
            cout << "  ";
        }
        for (int j = 0; j <= i; ++j)
        {
            cout << setw(2) << setfill('0') << ++num;
        }
        cout << endl;
    }

    return 0;
}