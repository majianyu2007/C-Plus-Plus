#include <iostream>
#include <vector>
#include <iomanip>

using std::cin;
using std::cout;
using std::endl;
using std::vector;
using std::fixed;
using std::setprecision;

int main(void)
{
    int n{0}, k{0};
    cin >> n >> k;
    vector<int> A, B;
    for (int i = 1; i <= n; ++i)
    {
        if (i % k == 0) 
        {
            A.push_back(i);
        }
        else
        {
            B.push_back(i);
        }
    }
    int A_sum{0}, B_sum{0};
    for (int a : A)
    {
        A_sum += a;
    }
    for (int b : B)
    {
        B_sum  += b;
    }
    cout << fixed << setprecision(1) << (double)A_sum / (double)A.size() << " " << (double)B_sum / (double)B.size() << endl;
    
    return 0;
}