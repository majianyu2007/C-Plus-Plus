#include <iostream>
#include <algorithm>

using namespace std;

int main(void)
{
    int n;
    cin >> n;
    
    int maxVal = 0, minVal = 1000;
    
    for (int i = 0; i < n; i++) {
        int a;
        cin >> a;
        maxVal = max(maxVal, a);
        minVal = min(minVal, a);
    }
    
    cout << maxVal - minVal << endl;
    
    return 0;
}