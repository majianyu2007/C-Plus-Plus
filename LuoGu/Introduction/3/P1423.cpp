#include <iostream>

using std::cin;
using std::cout;
using std::endl;

int main(void)
{
    double s{0.0}, finished{0}, last{2.0};
    int step{0};
    cin >> s;
    while (finished < s)
    {
        step++;
        if (step == 1)
        {
            finished += last;
        }
        else
        {
            finished += (last *= 0.98);
        }
    }
    cout << step << endl;
}