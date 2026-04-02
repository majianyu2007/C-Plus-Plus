#include <iostream>
#include <algorithm>
#include <new>

using std::cin;
using std::cout;
using std::endl;
using std::sort;

int main(void)
{
    int n{0};
    cin >> n;

    int * p = nullptr;
    p = new int[n];
    for (int i = 0; i < n; ++i)
    {
        cin >> p[i];
        cin.ignore();
    }

    sort(p, p + n);
    for (int i = 0; i < n; ++i)
    {
        cout << p[i] << " ";
    }
    cout << endl;

    delete p;
    return 0;
}