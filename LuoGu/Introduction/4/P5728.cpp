#include <iostream>

using namespace std;

int main(void)
{
    int n;
    cin >> n;
    
    int scores[1000][3];
    
    for (int i = 0; i < n; i++) {
        cin >> scores[i][0] >> scores[i][1] >> scores[i][2];
    }
    
    int count = 0;
    
    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            int total1 = scores[i][0] + scores[i][1] + scores[i][2];
            int total2 = scores[j][0] + scores[j][1] + scores[j][2];
            
            bool match = true;
            for (int k = 0; k < 3; k++) {
                if (abs(scores[i][k] - scores[j][k]) > 5) {
                    match = false;
                    break;
                }
            }
            
            if (match && abs(total1 - total2) <= 10) {
                count++;
            }
        }
    }
    
    cout << count << endl;
    
    return 0;
}