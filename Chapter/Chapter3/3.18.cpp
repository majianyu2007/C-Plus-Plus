#include <iostream>

using std::cout;
using std::endl;

int main(void)
{
    for (int i = 9; i >= 1; --i)
    {
        for (int k = 9; k > i; --k)
            cout << "        ";

        for (int j = i; j >= 1; --j)
        {
            cout << i << "*" << j << "=" << i * j;
            if (j > 1)
                cout << (i * j < 10 ? "   " : "  ");
        }
        cout << endl;
    }
    return 0;
}
