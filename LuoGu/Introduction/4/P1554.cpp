#include <iostream>

using std::cin;
using std::cout;
using std::endl;

int main(void)
{
    int num[10] = {0};
    int M{0}, N{0};
    cin >> M >> N;
    for (int i = M; i <= N; ++i)
    {
        int temp = i;
        do
        {
            num[temp % 10]++;
            temp /= 10;
        } while (temp);
    }
    for (int j = 0; j < 10; ++j)
    {
        cout << num[j] << " ";
    }
    cout << endl;

    return 0;
}