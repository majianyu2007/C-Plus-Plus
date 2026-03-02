#include <iostream>

using std::cin;
using std::cout;
using std::endl;


int main(void)
{
    int a{0}, b{0}, c{0}, d{0};
    cin >> a >> b >> c >> d;
    int previous = a * 60 + b, last = c * 60 + d;
    int minutes = last - previous, hours{0};
    for (; minutes >= 60; hours++)
    {
        minutes -= 60;
    }
    cout << hours << " " << minutes << endl;
    return 0;
}