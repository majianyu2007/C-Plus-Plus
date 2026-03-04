#include <iostream>
#include <iomanip>

using std::cin;
using std::cout;
using std::endl;
using std::setw;
using std::setfill;

int main(void)
{
    int n{0};
    cin >> n;
    int num = 1;
    for (int i = n; i > 0; i--)
    {
        for (int j = 0; j < i; j++)
        {
            cout << setw(2) << setfill('0') << num;
            num++;
        }
        cout << endl;
    }

    return 0;
}