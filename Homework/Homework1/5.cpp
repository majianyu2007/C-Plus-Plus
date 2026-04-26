/*
5.  编写程序，读入一个整数，然后以升序显示它的所有最小因子。例如，输入整数120，则输出应该是: 2, 2, 2, 3, 5。
*/
#include <iostream>

using std::cin;
using std::cout;
using std::endl;

int main(void)
{
    int n;
    cin >> n;

    bool first = true;
    for (int factor = 2; n > 1; factor++) {
        while (n % factor == 0) {
            if (!first) cout << ", ";
            cout << factor;
            first = false;
            n /= factor;
        }
    }
    cout << endl;

    return 0;
}
