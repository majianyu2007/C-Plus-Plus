#include <iostream>

using std::cin;
using std::cout;
using std::endl;

int main(void)
{
    int x;
    int pos = 0, neg = 0, count = 0, sum = 0;
    while (cin >> x && x != 0)
    {
        if (x > 0) pos++;
        else neg++;
        sum += x;
        count++;
    }
    if (count > 0)
    {
        cout << "Sum: " << sum << endl;
        cout << "Average: " << static_cast<double>(sum) / count << endl;
        cout << "Positive numbers: " << pos << endl;
        cout << "Negative numbers: " << neg << endl;
    }
    else
    {
        cout << "No numbers were entered." << endl;
    }
    return 0;
}