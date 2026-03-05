#include <iostream>

using std::cin;
using std::cout;
using std::endl;

int main(void)
{
    int n{0}, x{0};
    cin >> n >> x;
    int count{0};
    for (int i = 1; i <= n; i++)
    {
        int temp{0};
        temp = i;
        while(temp)
        {
            if (temp % 10 == x)
            {
                count++;
            }
            temp /= 10;
        }
    }
    cout << count << endl;
    return 0;
}