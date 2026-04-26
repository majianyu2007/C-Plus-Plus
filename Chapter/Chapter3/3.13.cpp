#include <iostream>

using std::cout;
using std::endl;

int main(void)
{
    for (int i = 1; i <= 9; i++)
    {
        for (int j = 1; j <= 9 - i; j++) cout << " ";
        for (int k = 1; k <= i; k++) cout << i << " "; 
        for (int j = 1; j <= 9 - i; j++) cout << " ";
        cout << endl;
    }

    return 0;
}