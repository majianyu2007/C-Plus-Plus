#include <iostream>

using std::cin;
using std::cout;
using std::endl;

int main(void)
{
    int x;
    cin >> x;
    cout << "Today, I ate " << x << " apple";
    if (x > 1) cout << "s";
    cout << "." << endl;
    return 0;
}