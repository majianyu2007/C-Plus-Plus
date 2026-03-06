#include <iostream>

using std::cin;
using std::cout;
using std::endl;

int main(void)
{
    int k{0}, n{1}, days{0}, coin{0};
    cin >> k;

    for (int i = 0; i < k; ++i)
    {
        coin += n;
        days++;
        if (days == n)
        {
            n++;
            days = 0;
        }
    }
    cout << coin << endl;
    return 0;
}