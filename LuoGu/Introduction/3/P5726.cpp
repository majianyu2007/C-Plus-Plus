#include <iostream>
#include <iomanip>
#include <algorithm>
#include <vector>

using namespace std;

int main(void)
{
    int n;
    cin >> n;
    
    vector<int> scores(n);
    for (int i = 0; i < n; i++) {
        cin >> scores[i];
    }
    
    sort(scores.begin(), scores.end());
    
    double sum = 0;
    for (int i = 1; i < n - 1; i++) {
        sum += scores[i];
    }
    
    double avg = sum / (n - 2);
    
    cout << fixed << setprecision(2) << avg << endl;
    
    return 0;
}