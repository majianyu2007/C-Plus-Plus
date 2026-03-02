#include <iostream>
#include <cmath>

using std::cin;
using std::cout;
using std::floor;
using std::endl;

#define PRICE 19

int main(void)
{
    int a{0}, b{0};
    cin >> a >> b;
    int money = a * 10 + b;
    cout << floor(money / PRICE) << endl;
    return 0;
}