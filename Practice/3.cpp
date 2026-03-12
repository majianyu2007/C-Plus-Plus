#include <iostream>
#include <string>

using std::cin;
using std::cout;
using std::endl;
using std::string;

template <typename T>
void Swap(T& a, T& b)
{
    T temp = a;
    a = b;
    b = temp;
}


int main()
{
    int a, b;
    double x, y;
    string str1, str2;
    cin >> a >> b;
    cin >> x >> y;
    cin >> str1 >> str2;
    Swap(a, b);
    Swap(x, y);
    Swap(str1, str2);
    cout << a << " " << b << endl;
    cout << x << " " << y << endl;
    cout << str1 << " " << str2 << endl;
    return 0;
}