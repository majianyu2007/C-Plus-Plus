#include <iostream>

using std::cout;
using std::endl;

long long factorial(int n)
{
    if (n == 0) return 1;
    return n * factorial(n - 1);
}

int main(void)
{
    long long result = 0;
    for (int i = 1; i <= 10; i++)
    {
        result += factorial(i);
    }
        cout << result << endl;

    return 0;
}