#include <iostream>

using std::cout;
using std::endl;

bool is_prime(int n)
{
    if (n < 2) return false;
    if (n == 2) return true;
    if (n % 2 == 0) return false;
    for (int divisor = 3; divisor * divisor <= n; divisor += 2)
    {
        if (n % divisor == 0)
            return false;
    }
    return true;
}

int main(void)
{
    for (int i = 2; i <= 100; i++)
    {
        if (is_prime(i))
            cout << i << " ";
    }
    cout << endl;

    return 0;
}