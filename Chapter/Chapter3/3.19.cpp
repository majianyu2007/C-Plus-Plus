#include <iostream>

using std::cout;
using std::endl;

int main(void)
{
    for (int i = 1000; i < 10000; i++)
    {
        int temp = i;
        int a = 0, b = 0, c = 0, d = 0;
        while (temp)
        {
            int digit = temp % 10;
            if (digit == 1)
            {
                a++;
            }
            else if (digit == 2)
            {
                b++;
            }
            else if (digit == 3)
            {
                c++;
            }
            else if (digit == 4)
            {
                d++;
            }
            temp /= 10;
        }
        if (a == 1 && b == 1 && c == 1 && d == 1) cout << i << " ";
    }
    cout << endl;
    return 0;
}