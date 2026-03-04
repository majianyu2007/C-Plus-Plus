#include <iostream>

using std::cin;
using std::cout;
using std::endl;

int main(void)
{
    int n{0};
    cin >> n;
    if (5 * n > 3 * n + 11)
    {
        cout << "Luogu" << endl;
    }
    else
    {
        cout << "Local" << endl;
    }

    return 0;
}