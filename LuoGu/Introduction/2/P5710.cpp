#include <iostream>

using std::cin;
using std::cout;
using std::endl;

int func1(int x)
{
    if (x % 2) return 0;
    return 1;
}

int func2(int x)
{
    if (x > 4 && x <= 12) return 1;
    return 0;
}

int main(void)
{
    int x;
    cin >> x;

    if (func1(x) && func2(x))
    {
        cout << "1";
    }
    else
    {
        cout << "0";
    }
    cout << " ";
    
    if (func1(x) || func2(x))
    {
        cout << "1";
    }
    else
    {
        cout << "0";
    }
    cout << " ";
    
    if ((func1(x) || func2(x)) && !(func1(x) && func2(x)))
    {
        cout << "1";
    }
    else
    {
        cout << "0";
    }
    cout << " ";

    if (!func1(x) && !func2(x))
    {
        cout << "1";
    }
    else
    {
        cout << "0";
    }
    cout << endl;

    return 0;
}