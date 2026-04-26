#include <iostream>

using std::cout;
using std::endl;

int main(void)
{
    for (int i = 1; i <= 9; ++i)
    {
        for (int j = 1; j <= i; ++j)
        {
            if (j == i)
            {
                cout << j << "*" << i << "=" << j * i << endl;
            }
            else
            {
                cout << j << "*" << i << "=" << j * i << " ";
            }
        }
    }
}