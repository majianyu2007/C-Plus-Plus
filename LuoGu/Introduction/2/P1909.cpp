#include <iostream>
#include <climits>

using std::cin;
using std::cout;
using std::endl;
using std::min;

int main(void)
{
    int n;
    cin >> n;
    
    long long minCost = LLONG_MAX;
    
    for (int i = 0; i < 3; i++) {
        int count, price;
        cin >> count >> price;
        
        int packages = (n + count - 1) / count;
        long long totalCost = (long long)packages * price;
        
        minCost = min(minCost, totalCost);
    }
    
    cout << minCost << endl;
    
    return 0;
}