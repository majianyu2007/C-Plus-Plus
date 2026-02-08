#include <iostream>

using std::cin;
using std::cout;
using std::endl;

int main(void)
{
    int a{0};
    int result{0};
    cin >> a;

    while(a)
    {
        result += a % 10;
        a /=10;
    }

    cout << result << endl;

    return 0;
}