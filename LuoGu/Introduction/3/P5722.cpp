#include <iostream>

using std::cin;
using std::cout;
using std::endl;

int main(void)
{
    int n{0};
    cin >> n;
    int result{0};
    for (int i = 1; i <= n; ++i) result += i;
    cout << result << endl;
    return 0;
}