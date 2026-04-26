#include <iostream>
#include <iomanip>
using namespace std;

int main() {
    int scores[2][3];
    
    cout << "Enter scores for 2 students (3 subjects each):" << endl;
    for (int i = 0; i < 2; i++) {
        cout << "Student " << i + 1 << ": ";
        for (int j = 0; j < 3; j++) {
            cin >> scores[i][j];
        }
    }
    
    // Process each student
    for (int i = 0; i < 2; i++) {
        int maxScore = scores[i][0];
        int minScore = scores[i][0];
        int sum = 0;
        
        // Find max, min, and sum
        for (int j = 0; j < 3; j++) {
            if (scores[i][j] > maxScore) maxScore = scores[i][j];
            if (scores[i][j] < minScore) minScore = scores[i][j];
            sum += scores[i][j];
        }
        
        double average = sum / 3.0;
        
        cout << fixed << setprecision(2);
        cout << "Student " << i + 1 << ":" << endl;
        cout << "  Highest: " << maxScore << endl;
        cout << "  Lowest: " << minScore << endl;
        cout << "  Average: " << average << endl;
    }
    
    return 0;
}