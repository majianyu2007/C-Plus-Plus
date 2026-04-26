#include <iostream>
#include <string>

using std::cin;
using std::cout;
using std::endl;
using std::string;

int main() {
    int score;
    string grade;
    
    cout << "Please enter the student's score: ";
    cin >> score;
    
    switch (score / 10) {
        case 9:
            grade = "优秀";
            break;
        case 8:
            grade = "良好";
            break;
        case 7: case 6:
            grade = "及格";
            break;
        default:
            grade = "不及格";
            break;
    }
    
    cout << "Student grade: " << grade << endl;
    
    return 0;
}