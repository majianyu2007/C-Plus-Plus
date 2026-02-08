#include <iostream>

using std::cin;
using std::cout;
using std::endl;

int main(void)
{
    int a[3]{}, temp = 0;
    cin >> a[0] >> a[1] >> a[2];
    for (int i = 0; i < 2; ++i)
    {
        if(a[i] > a[i + 1])
        {
            temp = a[i];
            a[i] = a[i + 1];
            a[i + 1] = temp;
        }
    }
    cout << a[0] << " " << a[1] << " " << a[2] << endl;

    return 0;
}