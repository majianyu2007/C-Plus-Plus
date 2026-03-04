#include <iostream>

using std::cin;
using std::cout;
using std::endl;

int main(void)
{
    int maxHours = 0;
    int unhappyDay = 0;
    
    for (int i = 1; i <= 7; i++)
    {
        int school, extra;
        cin >> school >> extra;
        
        int total = school + extra;
        
        if (total > 8 && total > maxHours)
        {
            maxHours = total;
            unhappyDay = i;
        }
    }
    
    cout << unhappyDay << endl;
    return 0;
}