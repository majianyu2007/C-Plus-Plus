#include <iostream>

using std::cin;
using std::cout;
using std::endl;

int main(void)
{
    int n{0}, counter{1}, maxCounter{1}, last{-2}, current{0};
    cin >> n;

    for (int i = 0; i < n; ++i)
    {
        cin >> current;
        if (current == last + 1)
        {
            counter++;
        }
        else
        {
            counter = 1;
        }
        if (counter > maxCounter)
        {
            maxCounter = counter;
        }
        last = current;
    }
    cout << maxCounter << endl;

    return 0;
}