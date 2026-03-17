#include <iostream>

using std::cin;
using std::cout;
using std::endl;

int main(void)
{
    int n{0};
    cin >> n;
    int win[7];
    int prize[8] = {0};
    for (int i = 0; i < 7; ++i)
    {
        cin >> win[i];
    }

    for (int j = 0; j < n; ++j)
    {
        int cnt{0};
        int num[7];
        for (int k = 0; k < 7; ++k)
        {
            cin >> num[k];
        }
        for (int l = 0; l < 7; ++l)
        {
            for (int m = 0; m < 7; ++m)
            {
                if (num[m] == win[l]) cnt++;
            }
        }
        prize[cnt]++;
    }

    for (int o = 7; o >= 1; --o)
    {
        cout << prize[o];
        if (o != 1) cout << " ";
    }
    cout << endl;

}
